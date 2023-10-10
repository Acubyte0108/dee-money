import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import Work, { Customer } from "../components/Work";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMediaQuery } from "react-responsive";

jest.mock("react-responsive", () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock("axios");

const mockCustomers: Customer[] = [
  {
    id: "1",
    firstName: "TestOne",
    lastName: "Test-LastOne",
    title: "Corporate Tactics Engineer",
    email: "test1.last1@example.com",
    country: "Malta",
  },
  {
    id: "2",
    firstName: "TestTwo",
    lastName: "Test-LastTwo",
    title: "Corporate Tactics Engineer",
    email: "test2.last2@example.com",
    country: "Malta",
  },
];

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
         // turns retries off
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      // no more errors on the console for tests
      error: process.env.NODE_ENV === 'test' ? () => {} : console.error,
    },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Test Work component", () => {
  it("renders correctly", () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: mockCustomers,
      headers: {
        link: '<http://localhost:4000/customers?q=&_page=2>; rel="next", <http://localhost:4000/customers?q=&_page=2>; rel="last"',
      },
    });
    const { getByRole, getByPlaceholderText } = render(
      <QueryClientProvider client={queryClient}>
        <Work />
      </QueryClientProvider>
    );

    const addButton = getByRole("button", { name: /add customer/i });
    expect(addButton).toBeInTheDocument();

    const searchInput = getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("fetches and displays customers", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: mockCustomers,
      headers: {
        link: '<http://localhost:4000/customers?q=&_page=2>; rel="next", <http://localhost:4000/customers?q=&_page=2>; rel="last"',
      },
    });
    (useMediaQuery as jest.Mock).mockImplementation((query) => {
      if (query.query === "(min-width: 640px)") {
        return true;
      }
    });

    const { findByText, findAllByText, findByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <Work />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    const customersTable = await findByTestId("customers-table");
    expect(customersTable).toBeInTheDocument();

    for (const customer of mockCustomers) {
      const firstNameElement = await findByText(new RegExp(customer.firstName, "i"));
      expect(firstNameElement).toBeInTheDocument();

      const lastNameElement = await findByText(new RegExp(customer.lastName, "i"));
      expect(lastNameElement).toBeInTheDocument();

      const emailElement = await findByText(new RegExp(customer.email, "i"));
      expect(emailElement).toBeInTheDocument();

      const titleElements = await findAllByText(new RegExp(customer.title, "i"));
      expect(titleElements.length).toBe(
        mockCustomers.filter((c) => c.title === customer.title).length
      );

      const countryElements = await findAllByText(new RegExp(customer.country, "i"));
      expect(countryElements.length).toBe(
        mockCustomers.filter((c) => c.country === customer.country).length
      );
    }
  });

  it('displays loading state', () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 2000))
    );

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <Work />
      </QueryClientProvider>
    );

    expect(getByText('...Loading')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { findByText } = render(
      <QueryClientProvider client={queryClient}>
        <Work />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    const errorMessage = await findByText(/Failed to fetch customers list/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
