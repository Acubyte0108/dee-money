import { render, fireEvent } from "@testing-library/react";
import CustomersTable from "../components/CustomersTable";
import { Customer } from "../components/Work";
import { useMediaQuery } from 'react-responsive';

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}));

describe('Test CustomersTable component', () => {
  const mockHandleEditUser = jest.fn();
  const mockHandleDeleteUser = jest.fn();

  const customers: Customer[] = [
    {
        id: "1",
        firstName: "TestOne",
        lastName: "Test-LastOne",
        title: "Corporate Tactics Engineer",
        email: "test1.last1@example.com",
        country: "Malta"       
      },
      {
        id: "2",
        firstName: "TestTwo",
        lastName: "Test-LastTwo",
        title: "Corporate Tactics Engineer",
        email: "test2.last2@example.com",
        country: "Malta"
      },
  ];

  beforeEach(() => {
    (useMediaQuery as jest.Mock).mockImplementation((query) => {
      if (query.query === '(min-width: 640px)') {
        return true;
      }
      if (query.query === '(max-width: 639px)') {
        return false;
      }
    });
  });

  it('renders without crashing', () => {
    render(<CustomersTable customers={customers} handleEditUser={mockHandleEditUser} handleDeleteUser={mockHandleDeleteUser} />);
  });

  it('calls handleEditUser and handleDeleteUser when respective buttons are clicked', () => {
    const { getAllByTestId } = render(<CustomersTable customers={customers} handleEditUser={mockHandleEditUser} handleDeleteUser={mockHandleDeleteUser} />);
    
    const editButtons = getAllByTestId('edit-button');
    const deleteButtons = getAllByTestId('delete-button');

    fireEvent.click(editButtons[0]);
    expect(mockHandleEditUser).toHaveBeenCalledWith(customers[0]);

    fireEvent.click(deleteButtons[0]);
    expect(mockHandleDeleteUser).toHaveBeenCalledWith(customers[0]);
  });
});
