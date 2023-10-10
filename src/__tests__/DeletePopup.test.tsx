import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DeletePopup from "../components/DeletePopup";
import { Customer } from "../components/Work";

jest.mock("axios");

const mockCustomer: Customer = {
  id: "1",
  firstName: "Alice",
  lastName: "Johnson",
  title: "Corporate Tactics Engineer",
  email: "alice.johnson@example.com",
  country: "Malta",
};

const mockSetPageAfterDelete = jest.fn();
const mockToggle = jest.fn();

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        // turns retries off
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      // no more errors on the console for tests
      error: process.env.NODE_ENV === "test" ? () => {} : console.error,
    },
  });
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("Test DeletePopup component", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <DeletePopup
          userData={mockCustomer}
          setPageAfterDelete={mockSetPageAfterDelete}
          toggle={mockToggle}
        />
      </QueryClientProvider>
    );

    expect(
      getByText(/Are you sure, to delete this customer/i)
    ).toBeInTheDocument();
    expect(getByText(/Alice Johnson/i)).toBeInTheDocument();
  });

  it('calls delete function when "Delete" button is clicked', async () => {
    (axios.delete as jest.Mock).mockResolvedValueOnce({});

    const { getByRole } = render(
      <QueryClientProvider client={queryClient}>
        <DeletePopup
          userData={mockCustomer}
          setPageAfterDelete={mockSetPageAfterDelete}
          toggle={mockToggle}
        />
      </QueryClientProvider>
    );

    fireEvent.click(getByRole("button", { name: /Delete/i }));

    await waitFor(() => {
      expect((axios.delete as jest.Mock).mock.calls[0][0]).toContain(
        `/customers/${mockCustomer.id}`
      );
      expect(mockSetPageAfterDelete).toHaveBeenCalled();
      expect(mockToggle).toHaveBeenCalled();
    });
  });

  it("handles error when axios.delete fails", async () => {
    (axios.delete as jest.Mock).mockRejectedValueOnce(
      new Error("Delete failed")
    );

    const { getByRole, findByText } = render(
      <QueryClientProvider client={queryClient}>
        <DeletePopup
          userData={mockCustomer}
          setPageAfterDelete={mockSetPageAfterDelete}
          toggle={mockToggle}
        />
      </QueryClientProvider>
    );

    fireEvent.click(getByRole("button", { name: /Delete/i }));

    await waitFor(() =>
      expect((axios.delete as jest.Mock).mock.calls[0][0]).toContain(
        `/customers/${mockCustomer.id}`
      )
    );

    const errorMessage = await findByText(/Failed to delete customer/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
