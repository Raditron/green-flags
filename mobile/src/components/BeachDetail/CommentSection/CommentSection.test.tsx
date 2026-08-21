import type { User } from "firebase/auth";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../../../test/press";
import { TEST_SAFE_AREA_METRICS } from "../../../test/safeAreaMetrics";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { ToastProvider } from "../../../toast/ToastContext";
import { CommentSection } from "./CommentSection";
import { useComments } from "./hooks/useComments";
import type { UseCommentsResult } from "./hooks/useComments";
import { postComment } from "./data/postComment";
import { deleteComment } from "./data/deleteComment";
import type { CommentWithAuthor } from "./interfaces";

// Same seam as BeachDetail.test.tsx's useBeach/usePredictions mocks: useComments already has its
// own tests (useComments.test.ts), so this file stays a rendering/interaction test of
// CommentSection itself, driving the hook's return value directly rather than a real fetch.
jest.mock("./hooks/useComments", () => ({ useComments: jest.fn() }));

// postComment/deleteComment are called directly by CommentSection (no hook in between) — both
// already have their own data-layer tests (postComment.test.ts, deleteComment.test.ts).
jest.mock("./data/postComment", () => ({ postComment: jest.fn() }));
jest.mock("./data/deleteComment", () => ({ deleteComment: jest.fn() }));

// Same auth component-test seam as AccountControl/UserMenu/BeachDetail: mock AuthContext
// wholesale rather than the network. AuthScreen (rendered on a signed-out Post tap) reads
// signUp/logIn off this too.
const mockAuthState: { user: Pick<User, "uid" | "displayName" | "email"> | null } = { user: null };
jest.mock("../../../auth/AuthContext", () => ({
  useAuth: () => ({ ...mockAuthState, signUp: jest.fn(), logIn: jest.fn(), logOut: jest.fn() }),
}));

const BEACH_ID = "beach-a";

const OWN_USER = { uid: "uid-current", displayName: "Diver Dan", email: "diver@example.com" } as User;

const OWN_COMMENT: CommentWithAuthor = {
  id: "comment-own",
  description: "My own comment",
  createdOn: "2026-08-02T12:00:00.000Z",
  userId: "uid-current",
  beachId: BEACH_ID,
  displayName: "Diver Dan",
  email: "diver@example.com",
};

const OTHER_COMMENT: CommentWithAuthor = {
  id: "comment-other",
  description: "Lovely beach!",
  createdOn: "2026-08-01T12:00:00.000Z",
  userId: "uid-other",
  beachId: BEACH_ID,
  displayName: "Other Visitor",
  email: "other@example.com",
};

const mockRefetch = jest.fn();

function mockComments(overrides: Partial<UseCommentsResult> = {}) {
  jest.mocked(useComments).mockReturnValue({
    comments: [],
    loading: false,
    error: null,
    refetch: mockRefetch,
    ...overrides,
  });
}

function renderSection() {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <ToastProvider>
          <CommentSection beachId={BEACH_ID} />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

// RNTL v14's `fireEvent.changeText` is async under the hood, same as `fireEvent.press` (see
// press.ts) — every call site must be awaited or the state update it triggers hasn't landed yet
// by the time the next statement runs. Standing in for the web tests' `fireEvent.change` on a
// controlled <textarea>.
async function changeText(element: ReturnType<typeof screen.getByLabelText>, text: string) {
  await fireEvent.changeText(element, text);
}

beforeEach(() => {
  mockAuthState.user = null;
  mockRefetch.mockReset();
  jest.mocked(postComment).mockReset();
  jest.mocked(deleteComment).mockReset();
});

describe("CommentSection", () => {
  it("shows a plain heading while loading, then the comment count", async () => {
    mockComments({ loading: true });
    await renderSection();

    expect(screen.getByText("Comments")).toBeOnTheScreen();
  });

  it("renders comments newest-first (as given) with avatar initial, display name, and text", async () => {
    mockComments({ comments: [OWN_COMMENT, OTHER_COMMENT] });
    await renderSection();

    expect(screen.getByText("2 Comments")).toBeOnTheScreen();
    expect(screen.getByText("My own comment")).toBeOnTheScreen();
    expect(screen.getByText("Lovely beach!")).toBeOnTheScreen();
    expect(screen.getByText("D")).toBeOnTheScreen();
    expect(screen.getByText("O")).toBeOnTheScreen();
  });

  it("renders the empty-state message when the beach has no comments", async () => {
    mockComments({ comments: [] });
    await renderSection();

    expect(screen.getByText("No comments yet — be the first to leave one.")).toBeOnTheScreen();
    expect(screen.getByText("0 Comments")).toBeOnTheScreen();
  });

  it("disables submit for empty/whitespace-only or over-1000-char input, live-updating the counter", async () => {
    mockAuthState.user = OWN_USER;
    mockComments();
    await renderSection();

    const textarea = screen.getByLabelText("Add a comment");
    const submit = screen.getByRole("button", { name: "Post" });

    expect(submit).toBeDisabled();

    await changeText(textarea, "   ");
    expect(screen.getByText("3/1000")).toBeOnTheScreen();
    expect(submit).toBeDisabled();

    await changeText(textarea, "a valid comment");
    expect(screen.getByText("15/1000")).toBeOnTheScreen();
    expect(submit).not.toBeDisabled();

    await changeText(textarea, "a".repeat(1001));
    expect(screen.getByText("1001/1000")).toBeOnTheScreen();
    expect(submit).toBeDisabled();
  });

  it("opens AuthScreen instead of posting when attempting to submit while signed out", async () => {
    mockComments();
    await renderSection();

    await changeText(screen.getByLabelText("Add a comment"), "Hello there");
    await press(screen.getByRole("button", { name: "Post" }));

    expect(await screen.findByText("Welcome back")).toBeOnTheScreen();
    expect(postComment).not.toHaveBeenCalled();
  });

  it("posts a valid comment when signed in, clearing the draft and refetching", async () => {
    mockAuthState.user = OWN_USER;
    jest.mocked(postComment).mockResolvedValue(undefined);
    mockComments();
    await renderSection();

    const textarea = screen.getByLabelText("Add a comment");
    await changeText(textarea, "My own comment");
    await press(screen.getByRole("button", { name: "Post" }));

    expect(postComment).toHaveBeenCalledWith(BEACH_ID, OWN_USER, "My own comment");
    await waitFor(() => expect(textarea).toHaveProp("value", ""));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("shows a delete control only on the current user's own comments, deleting and refetching on press", async () => {
    mockAuthState.user = OWN_USER;
    jest.mocked(deleteComment).mockResolvedValue(undefined);
    mockComments({ comments: [OWN_COMMENT, OTHER_COMMENT] });
    await renderSection();

    const deleteButtons = screen.getAllByRole("button", { name: "Delete comment" });
    expect(deleteButtons).toHaveLength(1);

    await press(deleteButtons[0]);

    expect(deleteComment).toHaveBeenCalledWith(BEACH_ID, OWN_COMMENT.id, OWN_USER);
    await waitFor(() => expect(mockRefetch).toHaveBeenCalledTimes(1));
  });

  it("surfaces a comment fetch failure via the toast system", async () => {
    mockComments({ error: "Comments request failed with status 500" });
    await renderSection();

    expect(await screen.findByText("Could not load comments.")).toBeOnTheScreen();
  });

  it("surfaces a post failure via the toast system", async () => {
    mockAuthState.user = OWN_USER;
    jest.mocked(postComment).mockRejectedValue(new Error("nope"));
    mockComments();
    await renderSection();

    await changeText(screen.getByLabelText("Add a comment"), "Hello there");
    await press(screen.getByRole("button", { name: "Post" }));

    expect(await screen.findByText("Could not post comment.")).toBeOnTheScreen();
  });

  it("surfaces a delete failure via the toast system", async () => {
    mockAuthState.user = OWN_USER;
    jest.mocked(deleteComment).mockRejectedValue(new Error("nope"));
    mockComments({ comments: [OWN_COMMENT] });
    await renderSection();

    await press(screen.getByRole("button", { name: "Delete comment" }));

    expect(await screen.findByText("Could not delete comment.")).toBeOnTheScreen();
  });
});
