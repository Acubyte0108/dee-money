import { render, fireEvent, waitFor } from "@testing-library/react";
import FormModal from "../components/FormModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";

jest.mock("axios");

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

  (axios.get as jest.Mock).mockImplementation((url) => {
    if (url.endsWith("/countries")) {
      return Promise.resolve({
        data: [
          "Malta",
          "Pakistan",
          "Qatar",
          "Saint Pierre and Miquelon",
          "Tuvalu",
        ],
      });
    }
    if (url.endsWith("/titles")) {
      return Promise.resolve({
        data: [
          "Corporate Tactics Engineer",
          "International Intranet Architect",
          "Corporate Web Coordinator",
          "Product Interactions Agent",
          "Senior Optimization Coordinator",
        ],
      });
    }
  });

  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("Test FormModal component: Add new customer", () => {
  it("renders correctly", async () => {
    const { findByText, findByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );
    const formHeader = await findByText(/Add Customer/i);
    expect(formHeader).toBeInTheDocument();

    const fisrtNameInput = await findByLabelText(/First name/i);
    expect(fisrtNameInput).toBeInTheDocument();

    const lastNameInput = await findByLabelText(/Last name/i);
    expect(lastNameInput).toBeInTheDocument();

    const emailInput = await findByLabelText(/Email address/i);
    expect(emailInput).toBeInTheDocument();

    const titleSelect = await findByLabelText(/Title/i);
    expect(titleSelect).toBeInTheDocument();

    const countrySelect = await findByLabelText(/Country/i);
    expect(countrySelect).toBeInTheDocument();
  });

  it("submits the form with the correct data", async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({});

    const { findByText, findByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: "Bob" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "Williams" } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "bob.williams@example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((axios.post as jest.Mock).mock.calls[0][0]).toContain(
        "/customers"
      );
      expect((axios.post as jest.Mock).mock.calls[0][1]).toEqual({
        firstName: "Bob",
        lastName: "Williams",
        email: "bob.williams@example.com",
        title: "Corporate Tactics Engineer",
        country: "Malta",
      });
    });

    expect(mockToggle).toHaveBeenCalled();
  });

  it("displays an error message when form submission fails", async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error("Post failed"));

    const { findByText, findByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: "Bob" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "Williams" } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "bob.williams@example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((axios.post as jest.Mock).mock.calls[0][0]).toContain(
        "/customers"
      );
      expect((axios.post as jest.Mock).mock.calls[0][1]).toEqual({
        firstName: "Bob",
        lastName: "Williams",
        email: "bob.williams@example.com",
        title: "Corporate Tactics Engineer",
        country: "Malta",
      });
    });

    const errorMessage = await findByText(/Failed to summit the form/i);
    expect(errorMessage).toBeInTheDocument();
  });
});

describe("Test FormModal component: Edit existing customer", () => {
  const mockCustomer = {
    id: "2",
    firstName: "Charlie",
    lastName: "Brown",
    title: "Corporate Tactics Engineer",
    email: "charlie.brown@example.com",
    country: "Malta",
  };

  it("renders correctly with pre-filled data", async () => {
    const { findByText, findByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} userData={mockCustomer} />
      </QueryClientProvider>
    );

    expect(await findByText(/Edit Customer/i)).toBeInTheDocument();

    const firstNameInput = (await findByLabelText(
      /First name/i
    )) as HTMLInputElement;
    expect(firstNameInput.value).toBe(mockCustomer.firstName);
    const lastNameInput = (await findByLabelText(
      /Last name/i
    )) as HTMLInputElement;
    expect(lastNameInput.value).toBe(mockCustomer.lastName);

    const emailInput = (await findByLabelText(
      /Email address/i
    )) as HTMLInputElement;
    expect(emailInput.value).toBe(mockCustomer.email);

    const titleSelect = (await findByLabelText(/Title/i)) as HTMLSelectElement;
    expect(titleSelect.value).toBe(mockCustomer.title);

    const countrySelect = (await findByLabelText(
      /Country/i
    )) as HTMLSelectElement;
    expect(countrySelect.value).toBe(mockCustomer.country);
  });

  it("submits the form with the correct data", async () => {
    (axios.put as jest.Mock).mockResolvedValueOnce({});

    const { findByText, findByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} userData={mockCustomer} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: "Charliez" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "Brownz" } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "charliez.brownz@example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((axios.patch as jest.Mock).mock.calls[0][0]).toContain(
        `/customers/${mockCustomer.id}`
      );
      expect((axios.patch as jest.Mock).mock.calls[0][1]).toEqual({
        firstName: "Charliez",
        lastName: "Brownz",
        email: "charliez.brownz@example.com",
        title: "Corporate Tactics Engineer",
        country: "Malta",
      });
    });

    expect(mockToggle).toHaveBeenCalled();
  });

  it("displays an error message when form submission fails", async () => {
    (axios.patch as jest.Mock).mockRejectedValueOnce(new Error("Patch failed"));

    const { findByText, findByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} userData={mockCustomer} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: "Charliez" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "Brownz" } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "charliez.brownz@example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((axios.patch as jest.Mock).mock.calls[0][0]).toContain(
        `/customers/${mockCustomer.id}`
      );
      expect((axios.patch as jest.Mock).mock.calls[0][1]).toEqual({
        firstName: "Charliez",
        lastName: "Brownz",
        email: "charliez.brownz@example.com",
        title: "Corporate Tactics Engineer",
        country: "Malta",
      });
    });

    const errorMessage = await findByText(/Failed to summit the form/i);
    expect(errorMessage).toBeInTheDocument();
  });
});

describe("Test FormModal component: Form validation", () => {
  it("shows errors when submitting empty form", async () => {
    const { findByText, findByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );
    const submitButton = await findByText(/Submit/i);

    fireEvent.click(submitButton);

    const firstNameError = await findByTestId("first-name-error");
    expect(firstNameError).toHaveTextContent(/Please fill the first name/i);

    const lastNameError = await findByTestId("last-name-error");
    expect(lastNameError).toHaveTextContent(/Please fill the last name/i);

    const emailError = await findByTestId("email-error");
    expect(emailError).toHaveTextContent(/Please fill the email/i);
  });

  it("error occurs when submitting a form that contains non-English alphabets", async () => {
    const { findByText, findByLabelText, findByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: "Dave++" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "Kruger" } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "dave.kruger@example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    const firstNameError = await findByTestId("first-name-error");
    expect(firstNameError).toHaveTextContent(
      new RegExp("Must contain only English alphabets and \\( ' \\. - \\) symbols", "i")
    );
  });

  it("error occurs when submitting a form that starts with a lowercase letter and a symbol", async () => {
    const { findByText, findByLabelText, findByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: "dave" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "-Kruger" } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "dave.kruger@example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    const firstNameError = await findByTestId("first-name-error");
    expect(firstNameError).toHaveTextContent(
      /First character must be capitalized and not a symbol/i
    );

    const lastNameError = await findByTestId("last-name-error");
    expect(lastNameError).toHaveTextContent(
      /First character must be capitalized and not a symbol/i
    );
  });

  it("error occurs when submitting a form in which each word contains multiple instances of these symbols: ( ' . - )", async () => {
    const { findByText, findByLabelText, findByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: "D-a-ve" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "K'ruger.." } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "dave.kruger@example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    const firstNameError = await findByTestId("first-name-error");
    expect(firstNameError).toHaveTextContent(
      new RegExp("Each word can contain only one of these symbols: \\( ' \\. - \\)", "i")
    );

    const lastNameError = await findByTestId("last-name-error");
    expect(lastNameError).toHaveTextContent(
      new RegExp("Each word can contain only one of these symbols: \\( ' \\. - \\)", "i")
    );
  });

  it("error occurs when submitting a form with an incorrect spacebar format", async () => {
    const { findByText, findByLabelText, findByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: " Dave" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "Kru  Ger" } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "dave.kruger@example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    const firstNameError = await findByTestId("first-name-error");
    expect(firstNameError).toHaveTextContent(/Incorrect spacebar format/i);

    const lastNameError = await findByTestId("last-name-error");
    expect(lastNameError).toHaveTextContent(/Incorrect spacebar format/i);
  });

  it("error occurs when submitting a form with an incorrect email format", async () => {
    const { findByText, findByLabelText, findByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <FormModal toggle={mockToggle} />
      </QueryClientProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const fisrtNameInput = await findByLabelText(/First name/i);
    fireEvent.input(fisrtNameInput, { target: { value: "Dave" } });

    const lastNameInput = await findByLabelText(/Last name/i);
    fireEvent.input(lastNameInput, { target: { value: "Kruger" } });

    const emailInput = await findByLabelText(/Email address/i);
    fireEvent.input(emailInput, {
      target: { value: "dave.kruger.example.com" },
    });

    const titleSelect = await findByLabelText(/Title/i);
    fireEvent.change(titleSelect, {
      target: { value: "Corporate Tactics Engineer" },
    });

    const countrySelect = await findByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: "Malta" } });

    const submitButton = await findByText(/Submit/i);
    fireEvent.click(submitButton);

    const emailError = await findByTestId("email-error");
    expect(emailError).toHaveTextContent(/Invalid email/i);
  });
});
