import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DeletePopup from "../components/DeletePopup";
import { Customer } from "../components/Work";

jest.mock("axios");

const mockCustomer: Customer = {
  id: "1",
  firstName: "Test",
  lastName: "Test-Last",
  title: "Corporate Tactics Engineer",
  email: "test.last@example.com",
  country: "Malta",
};

const mockSetPageAfterDelete = jest.fn();
const mockToggle = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

describe("DeletePopup", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <QueryClientProvider client={new QueryClient()}>
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
    expect(getByText(/Test Test-Last/i)).toBeInTheDocument();
  });

  it('calls delete function when "Delete" button is clicked', async () => {
    (axios.delete as jest.Mock).mockResolvedValueOnce({});

    const { getByRole } = render(
      <QueryClientProvider client={new QueryClient()}>
        <DeletePopup
          userData={mockCustomer}
          setPageAfterDelete={mockSetPageAfterDelete}
          toggle={mockToggle}
        />
      </QueryClientProvider>
    );

    fireEvent.click(getByRole("button", { name: /Delete/i }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "http://localhost:4000/customers/1"
      );
      expect(mockSetPageAfterDelete).toHaveBeenCalled();
      expect(mockToggle).toHaveBeenCalled();
    });
  });
});
