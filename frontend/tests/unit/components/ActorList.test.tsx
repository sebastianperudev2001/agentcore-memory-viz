import { render, screen, fireEvent } from "@testing-library/react";
import ActorList from "@/components/actor/ActorList";
import { useActors } from "@/hooks/useActors";

const pushMock = jest.fn();
const fetchInitialActorsMock = jest.fn();
const fetchMoreActorsMock = jest.fn();
const resetActorsMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/hooks/useActors", () => ({
  useActors: jest.fn(),
}));

describe("ActorList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useActors as jest.Mock).mockReturnValue({
      actors: ["actor-1", "actor-2"],
      nextToken: "token-1",
      loading: false,
      error: null,
      fetchInitialActors: fetchInitialActorsMock,
      fetchMoreActors: fetchMoreActorsMock,
      resetActors: resetActorsMock,
    });
  });

  it("renders memory context and triggers initial fetch", () => {
    render(<ActorList memoryId="mem-1" />);

    expect(screen.getByText("Actors for mem-1")).toBeInTheDocument();
    expect(fetchInitialActorsMock).toHaveBeenCalledTimes(1);
  });

  it("calls fetchMoreActors when load more is clicked", () => {
    render(<ActorList memoryId="mem-1" />);

    fireEvent.click(screen.getByText("Load more actors"));

    expect(fetchMoreActorsMock).toHaveBeenCalledTimes(1);
  });

  it("shows error when present", () => {
    (useActors as jest.Mock).mockReturnValue({
      actors: [],
      nextToken: null,
      loading: false,
      error: "Boom",
      fetchInitialActors: fetchInitialActorsMock,
      fetchMoreActors: fetchMoreActorsMock,
      resetActors: resetActorsMock,
    });

    render(<ActorList memoryId="mem-1" />);

    expect(screen.getByText("Boom")).toBeInTheDocument();
  });
});
