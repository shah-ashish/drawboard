# Drawboard Codebase Navigation & Architecture Guide 🗺️

This document is your index for maintaining, updating, and fixing Drawboard. Every file in the codebase is modularized and under **150 lines of code**. Use the table below to find the exact file you need without having to read through the rest of the project.

---

## ⚡ Quick Task Router: Where Do I Go?

| What do you want to update or fix? | Exact File to Open |
| :--- | :--- |
| **Add a new tool (e.g. Star, Polygon, Cloud)** | [`src/components/Toolbar/Toolbar/ToolButtonList.tsx`](file:///src/components/Toolbar/Toolbar/ToolButtonList.tsx) & [`src/types/elements.ts`](file:///src/types/elements.ts) |
| **Change how a shape is drawn on canvas** | [`src/components/Canvas/renderer/renderPrimitives.ts`](file:///src/components/Canvas/renderer/renderPrimitives.ts) |
| **Change how frames (Browser / Phone / Figure) look** | [`src/components/Canvas/renderer/renderFrames.ts`](file:///src/components/Canvas/renderer/renderFrames.ts) |
| **Change how Todo cards or checkboxes look** | [`src/components/Canvas/renderer/renderTodo.ts`](file:///src/components/Canvas/renderer/renderTodo.ts) & [`renderTodoPin.ts`](file:///src/components/Canvas/renderer/renderTodoPin.ts) |
| **Fix or update inline text rendering / alignment** | [`src/components/Canvas/renderer/renderText.ts`](file:///src/components/Canvas/renderer/renderText.ts) |
| **Fix or adjust the dot grid background** | [`src/components/Canvas/renderer/renderGrid.ts`](file:///src/components/Canvas/renderer/renderGrid.ts) |
| **Fix selection boxes, resize handles, or snap dots** | [`src/components/Canvas/renderer/renderOverlays.ts`](file:///src/components/Canvas/renderer/renderOverlays.ts) |
| **Change mouse drag / drawing initiation** | [`src/components/Canvas/hooks/handlePointerDownLogic.ts`](file:///src/components/Canvas/hooks/handlePointerDownLogic.ts) |
| **Change mouse moving / dragging / snapping** | [`src/components/Canvas/hooks/handlePointerMoveLogic.ts`](file:///src/components/Canvas/hooks/handlePointerMoveLogic.ts) |
| **Change double-click text editing behavior** | [`src/components/Canvas/hooks/useCanvasTextEditing.ts`](file:///src/components/Canvas/hooks/useCanvasTextEditing.ts) |
| **Change Todo item click / pin / check behavior** | [`src/components/Canvas/hooks/useTodoItemClicks.ts`](file:///src/components/Canvas/hooks/useTodoItemClicks.ts) |
| **Fix Enter key / text commit on Todo items** | [`src/components/Canvas/hooks/handleCommitTodo.ts`](file:///src/components/Canvas/hooks/handleCommitTodo.ts) |
| **Change canvas zoom, wheel, or pan gestures** | [`src/components/Canvas/hooks/useCanvasPanZoom.ts`](file:///src/components/Canvas/hooks/useCanvasPanZoom.ts) |
| **Add or edit Right-Click Context Menu items** | [`src/components/Canvas/ContextMenu.tsx`](file:///src/components/Canvas/ContextMenu.tsx) |
| **Add or update keyboard shortcuts** | [`src/hooks/useGlobalShortcuts.ts`](file:///src/hooks/useGlobalShortcuts.ts) |
| **Add Cloud / DevOps tech logos** | [`src/constants/icons/cloudIcons.ts`](file:///src/constants/icons/cloudIcons.ts) |
| **Add Language / Framework logos** | [`src/constants/icons/frameworkIcons.ts`](file:///src/constants/icons/frameworkIcons.ts) |
| **Add Database / Messaging logos** | [`src/constants/icons/databaseIcons.ts`](file:///src/constants/icons/databaseIcons.ts) |
| **Add System / Architecture node icons** | [`src/constants/icons/systemIcons.ts`](file:///src/constants/icons/systemIcons.ts) |
| **Fix Icon CDN download or URL resolution** | [`src/constants/icons/resolver.ts`](file:///src/constants/icons/resolver.ts) |
| **Add or change Color Swatches** | [`src/components/Toolbar/StylePicker/ColorSection.tsx`](file:///src/components/Toolbar/StylePicker/ColorSection.tsx) |
| **Add or change Stroke Widths / Roughness** | [`src/components/Toolbar/StylePicker/StrokeSection.tsx`](file:///src/components/Toolbar/StylePicker/StrokeSection.tsx) |
| **Add or change Fonts / Text Alignment** | [`src/components/Toolbar/StylePicker/TypographySection.tsx`](file:///src/components/Toolbar/StylePicker/TypographySection.tsx) |
| **Modify PNG export rendering** | [`src/utils/export/exportPng.ts`](file:///src/utils/export/exportPng.ts) |
| **Modify SVG export rendering** | [`src/utils/export/exportSvg.ts`](file:///src/utils/export/exportSvg.ts) |
| **Modify JSON / `.bd` file save/load structure** | [`src/utils/export/exportJson.ts`](file:///src/utils/export/exportJson.ts) |
| **Fix hit testing (clicking on lines/ellipses)** | [`src/utils/geometry/hitTest.ts`](file:///src/utils/geometry/hitTest.ts) |
| **Fix 8-direction resize calculations** | [`src/utils/geometry/resize.ts`](file:///src/utils/geometry/resize.ts) |
| **Fix connector arrow port magnetic binding** | [`src/utils/geometry/connectors.ts`](file:///src/utils/geometry/connectors.ts) |
| **Fix copy / duplicate / paste logic** | [`src/hooks/useClipboard.ts`](file:///src/hooks/useClipboard.ts) |
| **Fix layer order (Bring forward, Send to back)** | [`src/hooks/useLayering.ts`](file:///src/hooks/useLayering.ts) |
| **Fix locking, grouping, or deleting elements** | [`src/hooks/useElementActions.ts`](file:///src/hooks/useElementActions.ts) |
| **Fix VS Code file sync, save, or extension host** | [`src/extension/editorProvider.ts`](file:///src/extension/editorProvider.ts) |
| **Fix Webview CSP or HTML loader** | [`src/extension/htmlProvider.ts`](file:///src/extension/htmlProvider.ts) |

---

## 📂 Detailed Directory Structure

```text
src/
├── extension/                       # VS Code Extension Host
│   ├── editorProvider.ts            # CustomTextEditorProvider & document synchronization
│   └── htmlProvider.ts              # Generates Webview HTML with CSP & resource URIs
├── extension.ts                     # Extension entry point (registers commands & providers)
│
├── types/
│   ├── elements.ts                  # WhiteboardElement, ToolType, ElementStyle definitions
│   └── canvas.ts                    # Point, Camera, BoundingBox, ResizeHandle definitions
│
├── constants/
│   ├── canvas.ts                    # Default camera, style presets, roughness & zoom limits
│   ├── icons.ts                     # Aggregates ICON_CATALOG and re-exports icon resolvers
│   └── icons/
│       ├── iconTypes.ts             # IconDefinition interface
│       ├── cloudIcons.ts            # Docker, Kubernetes, AWS, GCP, Azure, GitHub, Cloudflare, etc.
│       ├── frameworkIcons.ts        # React, Next.js, Vue, Python, Node, TypeScript, Go, Rust
│       ├── databaseIcons.ts         # Postgres, Mongo, Redis, MySQL, Kafka, SQLite, GraphQL, Nginx
│       ├── systemIcons.ts           # Server, Cloud node, Security, Network, Notification
│       └── resolver.ts              # CDN URL builder and prefix resolver (Iconify API)
│
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx               # Root canvas component (88 lines)
│   │   ├── types.ts                 # CanvasProps interface
│   │   ├── CanvasOverlay.tsx        # Floating textarea for live inline typing
│   │   ├── CanvasContextMenuWrapper.tsx # Bridges context menu actions to canvas
│   │   ├── ContextMenu.tsx          # Right-click context menu container
│   │   ├── ContextMenu/
│   │   │   ├── ContextMenuItem.tsx  # Reusable menu item row with hover & shortcut tags
│   │   │   ├── ContextMenuDivider.tsx# Menu separator line
│   │   │   ├── EditMenuItems.tsx    # Copy, Paste, Duplicate, Delete
│   │   │   └── LayerMenuItems.tsx   # Bring Forward, Send Backward, Bring to Front, Send to Back
│   │   ├── hooks/
│   │   │   ├── useCanvasPanZoom.ts  # Spacebar pan, mouse wheel zoom, cursor styles
│   │   │   ├── useCanvasRedraw.ts   # requestAnimationFrame redraw loop & High-DPI scaling
│   │   │   ├── usePointerInteractions.ts # Pointer down, move, and up coordinator
│   │   │   ├── handlePointerDownLogic.ts # Tool placement, port drag-to-connect, hit-test
│   │   │   ├── handlePointerMoveLogic.ts # Drag moving, resizing, marquee selection, magnetic snap
│   │   │   ├── useCanvasTextEditing.ts   # Double-click text editing lifecycle
│   │   │   ├── handleCommitTodo.ts       # Todo list item editing, auto-pruning, Enter-key next item
│   │   │   ├── useTodoItemClicks.ts      # Pin button, checkbox toggle, and "+ Add task" clicks
│   │   │   ├── useCreationTool.ts        # Element instantiator for active tool
│   │   │   └── canvasHover.ts            # Hover hit-test for shapes, handles, and ports
│   │   └── renderer/
│   │       ├── renderCanvas.ts      # Main rendering coordinator loop
│   │       ├── renderPrimitives.ts  # Rectangle, Ellipse, Line, Arrow, Arrowhead
│   │       ├── renderFrames.ts      # Browser Mockup, Mobile Phone Mockup, Figure Frame
│   │       ├── renderTodo.ts        # Todo sticky note card, progress pill, checklist rows
│   │       ├── renderTodoPin.ts     # Pin button & pin needle icon
│   │       ├── renderText.ts        # 2D aligned text with multi-line word wrapping
│   │       ├── renderIcons.ts       # Tech logos with image caching & placeholder fallback
│   │       ├── renderOverlays.ts    # Selection boxes, 8 resize handles, connection port dots
│   │       └── renderGrid.ts        # Single-call Path2D batched dot grid
│   │
│   └── Toolbar/
│       ├── Toolbar.tsx              # Top floating tool bar container
│       ├── Toolbar/
│       │   ├── ToolButtonList.tsx   # Tool selection buttons (Select, Draw, Shapes, Text, Todo, Pan)
│       │   └── SelectionActionButtons.tsx # Floating lock, group, ungroup, and delete buttons
│       ├── StylePicker.tsx          # Left floating style panel (colors, stroke, font)
│       ├── StylePicker/
│       │   ├── ColorSection.tsx     # Stroke and Fill color palettes
│       │   ├── StrokeSection.tsx    # Stroke thickness and Roughness feel options
│       │   └── TypographySection.tsx# Font family, font size, and 2D text alignment
│       ├── InsertModal.tsx          # 200,000+ tech logo & frame insertion dialog
│       ├── InsertModal/
│       │   ├── InsertModalHeader.tsx# Search input and category filter tabs
│       │   ├── InsertIconsGrid.tsx  # Searchable grid with hover cards
│       │   ├── InsertFramesSection.tsx # Device frame mockup cards
│       │   ├── IconThumbnail.tsx    # Async image loader with retry mechanism
│       │   └── useIconSearch.ts     # Debounced live Iconify search hook
│       ├── ExportMenu.tsx           # Export dropdown menu
│       ├── ExportMenu/
│       │   ├── ExportOptionItem.tsx # Menu row component
│       │   └── ExportScopeSelector.tsx # Toggle between "All" and "Selected"
│       └── ActionControls.tsx       # Bottom-left zoom & history controls
│       └── ActionControls/
│           ├── HistoryButtons.tsx   # Undo and Redo buttons
│           └── ZoomButtons.tsx      # Zoom In, Zoom Out, Reset 100% button
│
├── hooks/                           # Application-Wide State Hooks
│   ├── useClipboard.ts              # Copy, duplicate, and paste logic
│   ├── useLayering.ts               # Bring forward, send backward, bring to front, send to back
│   ├── useElementActions.ts         # Group, ungroup, lock/unlock, delete
│   ├── useGlobalShortcuts.ts        # Global keydown listener
│   ├── useElementStyles.ts          # Synchronizes style picker with selected element
│   ├── useDocumentPersistence.ts    # Debounced autosave to VS Code TextDocument or local API
│   ├── useHistory.ts                # Undo / redo history stack
│   └── useTheme.ts                  # Detects VS Code theme and manages Dark/Light/System mode
│
├── utils/
│   ├── coordinates.ts               # screenToWorld, worldToScreen, zoomAroundPoint
│   ├── freehand.ts                  # Pressure-sensitive freehand stroke path generator
│   ├── iconCache.ts                 # Async HTMLImageElement cache with event subscriptions
│   ├── geometry/
│   │   ├── bounds.ts                # Bounding box calculations and marquee box intersection
│   │   ├── hitTest.ts               # Point-inside tests for shapes, lines, and resize handles
│   │   ├── resize.ts                # 8-direction handle resize coordinate math
│   │   └── connectors.ts            # Perimeter port positions and auto-pulling connector bindings
│   └── export/
│       ├── exportPng.ts             # 2x Retina canvas PNG exporter and clipboard copier
│       ├── exportSvg.ts             # Vector SVG generator for shapes and frames
│       ├── svgTodo.ts               # SVG generator for todo cards
│       └── exportJson.ts            # JSON and .bd file download & file import
│
└── services/
    ├── vscode.ts                    # VS Code acquireVsCodeApi() wrapper
    └── storage.ts                   # Standalone browser mode mock storage fallback
```

---

## 🛠️ Common How-To Recipes

### 1. How to Add a New Shape (e.g. Diamond)
1. Add `'diamond'` to `ElementType` in [`src/types/elements.ts`](file:///src/types/elements.ts).
2. Add a button in [`src/components/Toolbar/Toolbar/ToolButtonList.tsx`](file:///src/components/Toolbar/Toolbar/ToolButtonList.tsx).
3. Add render logic in [`src/components/Canvas/renderer/renderPrimitives.ts`](file:///src/components/Canvas/renderer/renderPrimitives.ts).
4. Add hit testing in [`src/utils/geometry/hitTest.ts`](file:///src/utils/geometry/hitTest.ts).
5. Add SVG export case in [`src/utils/export/exportSvg.ts`](file:///src/utils/export/exportSvg.ts).

### 2. How to Add Tech Logos
1. Open the matching file in `src/constants/icons/`:
   - Cloud / DevOps &rarr; [`cloudIcons.ts`](file:///src/constants/icons/cloudIcons.ts)
   - Frameworks &rarr; [`frameworkIcons.ts`](file:///src/constants/icons/frameworkIcons.ts)
   - Databases &rarr; [`databaseIcons.ts`](file:///src/constants/icons/databaseIcons.ts)
   - System Blocks &rarr; [`systemIcons.ts`](file:///src/constants/icons/systemIcons.ts)
2. Add the icon definition:
   ```ts
   {
     key: 'supabase',
     name: 'Supabase',
     category: 'databases',
     url: 'https://api.iconify.design/logos/supabase-icon.svg'
   }
   ```

### 3. How to Add / Edit a Keyboard Shortcut
1. Open [`src/hooks/useGlobalShortcuts.ts`](file:///src/hooks/useGlobalShortcuts.ts).
2. Add the key check inside `handleKeyDown`:
   ```ts
   } else if (e.key === 'D') {
     actions.onDuplicate();
   }
   ```

---

## 📦 Build Commands

- **`npm run dev`**: Start the local Vite development server on `http://localhost:3000`.
- **`npm run build`**: Builds both the webview (`dist/webview`) and the extension (`dist/extension.js`).
- **`npm run package`**: Creates the `.vsix` package for installation in VS Code.
