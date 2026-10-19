# Drawboard 🎨

<p align="center">
  <img src="https://raw.githubusercontent.com/shah-ashish/drawboard/main/media/icon.png" width="128" height="128" alt="Drawboard Icon" />
</p>

<p align="center"> 
  <strong>The visual architecture whiteboard and hand-drawn diagramming tool for Visual Studio Code.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#keyboard-shortcuts">Shortcuts</a> •
  <a href="#file-format">File Format</a>
</p>

---

## Overview

**Drawboard** brings an infinite, fluid whiteboard canvas directly into your VS Code editor. Design system architectures, cloud infrastructure diagrams, flowchart algorithms, and UI wireframes without ever switching windows.

All diagrams are saved as clean, human-readable **`.bd`** files directly in your workspace repository, making them 100% Git-friendly for pull requests, commits, and team collaboration.

---

## ✨ Features

### 🖌️ Hand-Drawn & Crisp Vector Drawing
- **Dual Drawing Styles**: Toggle between organic hand-drawn roughness (powered by RoughJS) or clean, crisp geometric strokes.
- **Rich Shape Primitives**: Rectangles, Ellipses, Lines, Curved Arrows, and 60 FPS pressure-sensitive Freehand pen (powered by Perfect-Freehand).
- **Text Alignment**: 2D horizontal (Left, Center, Right) and vertical (Top, Middle, Bottom) alignment with auto-wrapping inside any box.

### 🌐 200,000+ Tech Brand Logos & Architecture Icons
- Instant searchable library of official tech brands and cloud infrastructure logos (Docker, Kubernetes, AWS, Azure, Google Cloud, React, Next.js, Python, PostgreSQL, Redis, Kafka, and more).
- Powered by Iconify CDN with offline/CORS resilience in VS Code webviews.

### 📱 Device Window Frames
- Drag-and-drop **Browser Window** mockups (with macOS traffic lights and address bar) and **Mobile Phone** mockups.
- Double-click any device frame header to rename titles or web URLs.

### 🔗 Smart Auto-Binding Connectors
- Arrows and lines automatically detect proximity ports (Top, Bottom, Left, Right) on shapes, icons, and device frames.
- Moving connected shapes automatically pulls and repositions the arrow paths.

### 🌓 Seamless Light & Dark Theme Adaptation
- Automatically synchronizes with your VS Code color theme (`vscode-dark`, `vscode-light`, or High Contrast).
- Includes an in-canvas Theme Mode switcher (**System 🖥️ / Dark 🌙 / Light ☀️**) with live contrast-corrected stroke colors and dot grid rendering.

### 📐 Layering, Grouping & Locking
- Group multiple shapes into a single unit (`Ctrl+G`), ungroup (`Ctrl+Shift+G`), re-order layers (Bring Forward, Send to Back), or Lock items (`L`) to prevent accidental dragging.

### 📂 Git-Friendly `.bd` Files
- Diagrams are saved locally in standard `.bd` files (plain JSON).
- No external cloud account or login required—everything stays private in your workspace repository.

---

## 🚀 Getting Started

1. **Create a file**: In your workspace file explorer, create any file ending with **`.bd`** (e.g., `architecture.bd`, `system-design.bd`, or `flow.bd`).
2. **Open Drawboard**: Simply click the `.bd` file. It will immediately open the interactive whiteboard custom editor!
3. **Command Palette**: You can also press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and run:
   ```text
   Drawboard: New Diagram Board (.bd)
   ```
4. **Insert Icons**: Press `I` or `/` on your canvas to open the 200,000+ tech logo search modal.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| **`1`** | Select / Transform Tool |
| **`2`** | Freehand Draw Tool |
| **`3`** | Rectangle Tool |
| **`4`** | Ellipse / Circle Tool |
| **`5`** | Arrow Connector Tool |
| **`6`** | Straight Line Tool |
| **`T`** | Text Box Tool |
| **`H`** | Hand / Pan Canvas Tool |
| **`I`** or **`/`** | Open Tech Icons & Device Mockup Modal |
| **`S`** | Toggle Floating Style & Color Panel |
| **`Ctrl + Z`** / **`Cmd + Z`** | Undo |
| **`Ctrl + Y`** / **`Ctrl + Shift + Z`** | Redo |
| **`Ctrl + S`** / **`Cmd + S`** | Save File (instant disk flush) |
| **`Ctrl + D`** | Duplicate Selected Element(s) |
| **`Ctrl + C`** / **`Ctrl + V`** | Copy and Paste |
| **`Ctrl + G`** | Group Selected Elements |
| **`Ctrl + Shift + G`** | Ungroup Selected Elements |
| **`Ctrl + ]`** / **`Ctrl + [`** | Bring Forward / Send Backward |
| **`L`** | Lock / Unlock Selected Element(s) |
| **`Delete`** / **`Backspace`** | Delete Selected Element(s) |
| **`Space + Drag`** | Pan Canvas |
| **`Ctrl + Wheel`** | Zoom Canvas in / out |

---

## 📁 File Format (`.bd`)

Drawboard stores diagrams using a clean JSON format:

```json
{
  "version": 1,
  "app": "drawboard",
  "elements": [
    {
      "id": "e-abc123",
      "type": "rectangle",
      "x": 100,
      "y": 120,
      "width": 180,
      "height": 90,
      "strokeColor": "#2563eb",
      "fillColor": "#eff6ff",
      "strokeWidth": 2,
      "roughness": 1,
      "text": "Auth Service"
    }
  ],
  "camera": {
    "x": 0,
    "y": 0,
    "zoom": 1
  }
}
```

> **Tip:** You can inspect or edit the raw JSON anytime by right-clicking the `.bd` tab and choosing **Reopen With... &rarr; Text Editor**.

---

## 🛡️ License

MIT License. Designed with ❤️ for developers and system architects.
