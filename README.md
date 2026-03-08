# Collaborative Spreadsheet

A lightweight real-time collaborative spreadsheet built with Next.js and Firebase.

## Tech Stack

- **Next.js App Router** - Modern React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase Firestore** - Real-time database
- **Firebase Authentication** - User authentication

## Features

- ✅ Real-time collaboration with presence indicators
- ✅ Spreadsheet grid editing with keyboard navigation
- ✅ Formula support (basic arithmetic and SUM functions)
- ✅ Clean, modern UI inspired by Google Sheets
- ✅ Responsive design
- ✅ Save status indicators
- ✅ Document management dashboard

## Architecture

The system uses Firebase Firestore snapshot listeners to synchronize spreadsheet state across clients in real time. Grid data is stored using a sparse cell model to reduce storage overhead and allow efficient updates.

### Data Model

```typescript
interface Grid {
  [cellId: string]: Cell; // Sparse storage: "A1", "B2", etc.
}

interface Cell {
  value: string;
  computed?: string | number;
}
```

### Formula Engine

A lightweight parser interprets formulas beginning with "=" and replaces cell references with values before evaluation.

Supported formulas:
- Arithmetic: `=A1+A2`, `=A1-B2`, `=A1*B1`, `=A1/B1`
- SUM ranges: `=SUM(A1:A10)`

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collaborative-spreadsheet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore and Authentication
   - Update the Firebase configuration in `lib/firebase.ts`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
/app
  /dashboard
    page.tsx          # Document listing dashboard
  /doc/[id]
    page.tsx          # Spreadsheet editor

/components
  /grid
    Grid.tsx          # Main spreadsheet grid
    Cell.tsx          # Individual cell component
    RowHeader.tsx     # Row numbers
    ColumnHeader.tsx  # Column letters
  /editor
    EditorHeader.tsx  # Document title and presence
    FormulaBar.tsx    # Formula input bar
    SaveIndicator.tsx # Save status
  /presence
    PresenceBar.tsx   # Active users display
    UserAvatar.tsx    # User avatar component

/hooks
  useDocument.ts      # Firebase document sync
  usePresence.ts      # Real-time presence management
  useKeyboardNavigation.ts # Keyboard shortcuts

/lib
  firebase.ts         # Firebase configuration
  formulaEngine.ts    # Formula evaluation
  gridUtils.ts        # Grid utility functions

/types
  spreadsheet.ts      # TypeScript type definitions
```

## Keyboard Navigation

- **Arrow Keys**: Navigate cells (← → ↑ ↓)
- **Tab**: Move right (Shift+Tab for left)
- **Enter**: Move down and commit edits
- **Escape**: Cancel editing
- **F2**: Start editing selected cell

## Real-time Features

### Collaboration
- Multiple users can edit the same spreadsheet simultaneously
- Presence indicators show who's currently active
- Changes sync in real-time across all connected clients

### Conflict Handling
- Last-write-wins strategy for simultaneous edits
- Cells briefly highlight when updated by remote users

## Limitations

- No advanced dependency graph for formulas
- Limited formula support (basic arithmetic + SUM)
- Single sheet per document
- No offline editing

## Future Improvements

- CRDT collaborative editing for better conflict resolution
- Advanced formula support (IF, VLOOKUP, etc.)
- Offline editing with sync
- Multi-sheet documents
- Cell formatting options
- Import/Export functionality (CSV, Excel)

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set up environment variables for Firebase
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
