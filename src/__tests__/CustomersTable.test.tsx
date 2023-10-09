import { render, fireEvent } from "@testing-library/react";
import CustomersTable from "../components/CustomersTable";
import { useMediaQuery } from "react-responsive";
import { Customer } from "../components/Work";

jest.mock("react-responsive", () => ({
  useMediaQuery: jest.fn(),
}));

beforeEach(() => {
  (useMediaQuery as jest.Mock).mockImplementation((query) => {
    if (query.query === "(min-width: 640px)") {
      return true;
    }
    if (query.query === "(max-width: 639px)") {
      return false;
    }
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

const mockHandleEditUser = jest.fn();
const mockHandleDeleteUser = jest.fn();

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

describe("Test CustomersTable component", () => {
  it("renders without crashing", () => {
    render(
      <CustomersTable
        customers={mockCustomers}
        handleEditUser={mockHandleEditUser}
        handleDeleteUser={mockHandleDeleteUser}
      />
    );
  });

  it("calls handleEditUser and handleDeleteUser when respective buttons are clicked", () => {
    const { getAllByTestId } = render(
      <CustomersTable
        customers={mockCustomers}
        handleEditUser={mockHandleEditUser}
        handleDeleteUser={mockHandleDeleteUser}
      />
    );

    const editButtons = getAllByTestId("edit-button");
    const deleteButtons = getAllByTestId("delete-button");

    fireEvent.click(editButtons[0]);
    expect(mockHandleEditUser).toHaveBeenCalledWith(mockCustomers[0]);

    fireEvent.click(deleteButtons[0]);
    expect(mockHandleDeleteUser).toHaveBeenCalledWith(mockCustomers[0]);
  });
});
