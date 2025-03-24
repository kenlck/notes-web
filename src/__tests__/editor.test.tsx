import { render, screen } from "@testing-library/react";
import { TiptapEditor } from "@/app/(authed)/notes/[id]/editor";
import userEvent from "@testing-library/user-event";
import { useEditor } from "@tiptap/react";

// Mock mutate functions
const mockUpdateMutate = jest.fn();
const mockDeleteMutate = jest.fn();
const mockInvalidate = jest.fn();

// Mock trpc hooks and utils
jest.mock("@/trpc/react", () => ({
  api: {
    notes: {
      update: {
        useMutation: () => ({
          mutate: mockUpdateMutate,
          isPending: false,
        }),
      },
      delete: {
        useMutation: () => ({
          mutate: mockDeleteMutate,
          onSuccess: (fn: () => void) => fn(),
        }),
      },
    },
    useUtils: () => ({
      notes: {
        getDirectory: {
          invalidate: mockInvalidate,
        },
      },
    }),
  },
}));

// Mock the TipTap editor
jest.mock("@tiptap/react", () => ({
  useEditor: jest.fn(() => ({
    chain: () => ({
      focus: () => ({
        run: jest.fn(),
        undo: () => ({
          run: jest.fn(),
        }),
        redo: () => ({
          run: jest.fn(),
        }),
        bold: () => ({
          run: jest.fn(),
        }),
        italic: () => ({
          run: jest.fn(),
        }),
        strike: () => ({
          run: jest.fn(),
        }),
        toggleBold: () => ({
          run: jest.fn(),
        }),
      }),
    }),
    isActive: (type: string) => {
      if (type === "bold") return false;
      return false;
    },
    can: () => ({
      chain: () => ({
        focus: () => ({
          undo: () => ({
            run: () => true,
          }),
          redo: () => ({
            run: () => true,
          }),
          toggleBold: () => ({
            run: () => true,
          }),
          toggleItalic: () => ({
            run: () => true,
          }),
          toggleStrike: () => ({
            run: () => true,
          }),
          toggleBulletList: () => ({
            run: () => true,
          }),
          toggleOrderedList: () => ({
            run: () => true,
          }),
          toggleCode: () => ({
            run: () => true,
          }),
          toggleCodeBlock: () => ({
            run: () => true,
          }),
          toggleBlockquote: () => ({
            run: () => true,
          }),
        }),
        setHighlight: () => ({
          run: () => true,
        }),
        setColor: () => ({
          run: () => true,
        }),
      }),
    }),
    getHTML: () => "<p>Test content</p>",
    getAttributes: (attr: string) => {
      if (attr === "textStyle") {
        return { color: "#000000" };
      }
      if (attr === "highlight") {
        return { color: "#ffffff" };
      }
      return {};
    },
  })),
  EditorContent: ({ className }: { className: string }) => (
    <div className={className} data-testid="editor-content">
      Mock Editor Content
    </div>
  ),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({
    id: "test-note-id",
  }),
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe("TiptapEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the editor", () => {
    render(<TiptapEditor />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("renders toolbar buttons", () => {
    render(<TiptapEditor />);

    // Check for basic formatting buttons
    expect(screen.getByTitle("bold")).toBeInTheDocument();
    expect(screen.getByTitle("italic")).toBeInTheDocument();
    expect(screen.getByTitle("strikethrough")).toBeInTheDocument();
  });

  it("renders with initial content", () => {
    const initialContent = "<p>Test content</p>";
    render(<TiptapEditor content={initialContent} />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("shows delete dialog when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<TiptapEditor />);

    // Click the delete button
    const deleteButton = screen.getByTitle("delete");
    await user.click(deleteButton);

    // Check if dialog appears
    expect(screen.getByText("Delete Note")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this note? This action cannot be undone.")
    ).toBeInTheDocument();
  });

  it("closes delete dialog when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<TiptapEditor />);

    // Open dialog
    const deleteButton = screen.getByTitle("delete");
    await user.click(deleteButton);

    // Click cancel
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    // Check if dialog is closed
    expect(screen.queryByText("Delete Note")).not.toBeInTheDocument();
  });

  it("initializes editor with correct content", () => {
    const testContent = "<p>Test content</p>";
    render(<TiptapEditor content={testContent} />);

    const editorMock = useEditor as jest.Mock;
    const lastCall = editorMock.mock.calls[editorMock.mock.calls.length - 1];

    expect(lastCall[0]).toHaveProperty("content", testContent);
  });
});
