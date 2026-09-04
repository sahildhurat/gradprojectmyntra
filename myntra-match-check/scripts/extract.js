const fs = require('fs');
const path = require('path');

const screens = [
  { source: 'wishlist_myntra_match_check', dest: 'src/app/page.tsx', name: 'WishlistScreen' },
  { source: 'setup_context_flow', dest: 'src/app/check/[id]/page.tsx', name: 'ContextFlowScreen' },
  { source: 'result_ai_assessment', dest: 'src/app/check/[id]/result/page.tsx', name: 'ResultScreen' },
  { source: 'decision_checkpoint', dest: 'src/app/decision/[id]/page.tsx', name: 'DecisionScreen' },
  { source: 'inner_circle_share', dest: 'src/app/share/[token]/page.tsx', name: 'ShareScreen' },
  { source: 'inner_circle_friend_voting', dest: 'src/app/vote/[token]/page.tsx', name: 'VoteScreen' }
];

function convertHtmlToReact(html) {
  // Extract body content (excluding scripts at the end)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;

  // Remove scripts
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Convert class to className
  content = content.replace(/\bclass="/g, 'className="');
  
  // Convert for to htmlFor
  content = content.replace(/\bfor="/g, 'htmlFor="');

  // Convert HTML comments to React comments
  content = content.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  // Self-close tags
  const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link'];
  voidElements.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b([^>]*?)(?<!/)>`, 'gi');
    content = content.replace(regex, `<${tag}$1 />`);
  });
  
  // Style attribute string to object (naive implementation for inline styles)
  // Stitch AI might use style="width: 50%" - we replace this with className if possible, 
  // or just strip them if they are simple, or do a basic conversion.
  content = content.replace(/style="([^"]*)"/g, (match, p1) => {
    const rules = p1.split(';').filter(Boolean);
    const styleObj = rules.map(rule => {
      let [key, val] = rule.split(':').map(s => s.trim());
      key = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
      return `${key}: '${val}'`;
    }).join(', ');
    return `style={{ ${styleObj} }}`;
  });

  return content;
}

screens.forEach(screen => {
  const sourcePath = path.join(__dirname, '..', 'src', 'stitch-ui', screen.source, 'code.html');
  const destPath = path.join(__dirname, '..', screen.dest);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Source not found: ${sourcePath}`);
    return;
  }

  const html = fs.readFileSync(sourcePath, 'utf8');
  let jsx = convertHtmlToReact(html);

  // For dynamic routes, we need to add "use client" as these are interactive pages
  // But Next.js App Router expects async Server Components for data fetching.
  // We'll scaffold them as Client Components initially so the UI renders without hydration errors.
  
  const componentTemplate = `"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ${screen.name}() {
  const router = useRouter();

  return (
    <>
      ${jsx}
    </>
  );
}
`;

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(destPath, componentTemplate);
  console.log(`Generated ${destPath}`);
});
