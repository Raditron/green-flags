import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as firebaseAuth from "firebase/auth";
import { CommentSection } from "./CommentSection";
import { AuthProvider } from "../../../auth/AuthContext";
import { ToastProvider } from "../../Layout/Toast/ToastContext";

// Same Firebase mocking approach as AuthModal.test.tsx — the auth object and the signed-in user
// are created inside the factory (not referencing outer file-scope variables) to dodge vi.mock's
// hoisting, since the factory runs before the rest of this file's top-level code does.
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", () => {
  const authObj: { currentUser: unknown } = { currentUser: null };
  const mockUser = {
    uid: "uid-current",
    displayName: "Diver Dan",
    email: "diver@example.com",
    getIdToken: vi.fn(async () => "fake-id-token"),
  };

  return {
    __mockAuthObj: authObj,
    __mockUser: mockUser,
    getAuth: vi.fn(() => authObj),
    onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: unknown) => void) => {
      callback(authObj.currentUser);
      return () => {};
    }),
    createUserWithEmailAndPassword: vi.fn(async () => ({ user: mockUser })),
    updateProfile: vi.fn(async () => {}),
    sendEmailVerification: vi.fn(async () => {}),
    signInWithEmailAndPassword: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
  };
});

const mockAuthObj = (firebaseAuth as unknown as { __mockAuthObj: { currentUser: unknown } }).__mockAuthObj;
const mockUser = (
  firebaseAuth as unknown as {
    __mockUser: { uid: string; displayName: string; email: string; getIdToken: ReturnType<typeof vi.fn> };
  }
).__mockUser;

const BEACH_ID = "beach-a";

const OWN_COMMENT = {
  id: "comment-own",
  description: "My own comment",
  createdOn: "2026-08-02T12:00:00.000Z",
  userId: "uid-current",
  beachId: BEACH_ID,
  displayName: "Diver Dan",
  email: "diver@example.com",
};

const OTHER_COMMENT = {
  id: "comment-other",
  description: "Lovely beach!",
  createdOn: "2026-08-01T12:00:00.000Z",
  userId: "uid-other",
  beachId: BEACH_ID,
  displayName: "Other Visitor",
  email: "other@example.com",
};

function jsonResponse(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

function noContentResponse(): Response {
  return { ok: true, status: 204, json: async () => null } as Response;
}

function renderCommentSection() {
  render(
    <AuthProvider>
      <ToastProvider>
        <CommentSection beachId={BEACH_ID} />
      </ToastProvider>
    </AuthProvider>,
  );
  return userEvent.setup();
}

describe("CommentSection", () => {
  beforeEach(() => {
    mockAuthObj.currentUser = null;
    mockUser.getIdToken.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows a plain heading until the initial fetch resolves, then the comment count", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([OWN_COMMENT, OTHER_COMMENT]));
    renderCommentSection();

    expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole("heading", { name: "2 Comments" })).toBeInTheDocument());
  });

  it("renders inline (no modal to open), showing comments newest-first with avatar initial, display name, and text", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([OWN_COMMENT, OTHER_COMMENT]));
    renderCommentSection();
    await waitFor(() => expect(screen.getByRole("heading", { name: "2 Comments" })).toBeInTheDocument());

    expect(screen.getByText("My own comment")).toBeInTheDocument();
    expect(screen.getByText("Lovely beach!")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("O")).toBeInTheDocument();

    // OWN_COMMENT was returned first by the (already newest-first) backend response — its author
    // name should render before the other comment's in document order.
    const first = screen.getByText("Diver Dan");
    const second = screen.getByText("Other Visitor");
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders the empty-state message when the beach has no comments", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));
    renderCommentSection();

    expect(await screen.findByText("No comments yet — be the first to leave one.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "0 Comments" })).toBeInTheDocument();
  });

  it("disables submit for empty/whitespace-only or over-1000-char input, live-updating the counter", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));
    const user = renderCommentSection();
    await waitFor(() => expect(screen.getByRole("heading", { name: "0 Comments" })).toBeInTheDocument());

    const textarea = screen.getByLabelText("Add a comment");
    const submit = screen.getByRole("button", { name: "Post" });

    expect(submit).toBeDisabled();

    await user.type(textarea, "   ");
    expect(screen.getByText("3/1000")).toBeInTheDocument();
    expect(submit).toBeDisabled();

    fireEvent.change(textarea, { target: { value: "a valid comment" } });
    expect(screen.getByText("15/1000")).toBeInTheDocument();
    expect(submit).not.toBeDisabled();

    fireEvent.change(textarea, { target: { value: "a".repeat(1001) } });
    expect(screen.getByText("1001/1000")).toBeInTheDocument();
    expect(submit).toBeDisabled();
  });

  it("opens AuthModal instead of posting when attempting to submit while signed out", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));
    const user = renderCommentSection();
    await waitFor(() => expect(screen.getByRole("heading", { name: "0 Comments" })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Add a comment"), { target: { value: "Hello there" } });
    await user.click(screen.getByRole("button", { name: "Post" }));

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("posts a valid comment when signed in, clearing the draft and triggering a refetch", async () => {
    mockAuthObj.currentUser = mockUser;
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(noContentResponse())
      .mockResolvedValueOnce(jsonResponse([OWN_COMMENT]));

    const user = renderCommentSection();
    await waitFor(() => expect(screen.getByRole("heading", { name: "0 Comments" })).toBeInTheDocument());

    const textarea = screen.getByLabelText("Add a comment");
    fireEvent.change(textarea, { target: { value: "My own comment" } });
    await user.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => expect(textarea).toHaveValue(""));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(screen.getByRole("heading", { name: "1 Comment" })).toBeInTheDocument());
  });

  it("shows a delete icon only on the current user's own comments, deleting and refetching on click", async () => {
    mockAuthObj.currentUser = mockUser;
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([OWN_COMMENT, OTHER_COMMENT]))
      .mockResolvedValueOnce(noContentResponse())
      .mockResolvedValueOnce(jsonResponse([OTHER_COMMENT]));

    const user = renderCommentSection();
    await waitFor(() => expect(screen.getByRole("heading", { name: "2 Comments" })).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole("button", { name: "Delete comment" });
    expect(deleteButtons).toHaveLength(1);

    await user.click(deleteButtons[0]);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(screen.getByRole("heading", { name: "1 Comment" })).toBeInTheDocument());
  });

  it("surfaces a comment fetch failure via the toast system", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 500, json: async () => null } as Response);
    renderCommentSection();

    expect(await screen.findByText("Could not load comments.")).toBeInTheDocument();
  });

  it("surfaces a post failure via the toast system", async () => {
    mockAuthObj.currentUser = mockUser;
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ code: "invalid_description", message: "Could not post comment" }, 400));

    const user = renderCommentSection();
    await waitFor(() => expect(screen.getByRole("heading", { name: "0 Comments" })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Add a comment"), { target: { value: "Hello there" } });
    await user.click(screen.getByRole("button", { name: "Post" }));

    expect(await screen.findByText("Could not post comment.")).toBeInTheDocument();
  });

  it("surfaces a delete failure via the toast system", async () => {
    mockAuthObj.currentUser = mockUser;
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([OWN_COMMENT]))
      .mockResolvedValueOnce(jsonResponse({ code: "comment_not_found", message: "Could not delete comment" }, 404));

    const user = renderCommentSection();
    await waitFor(() => expect(screen.getByRole("heading", { name: "1 Comment" })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete comment" }));

    expect(await screen.findByText("Could not delete comment.")).toBeInTheDocument();
  });
});
