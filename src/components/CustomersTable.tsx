import { Customer } from "./Work";
import { useMediaQuery } from "react-responsive";
import { IconContext } from "react-icons"
import { FaPen, FaTrashAlt } from 'react-icons/fa'

type CustomersTableProps = {
  customers: Customer[];
  handleEditUser: (person: Customer) => void;
};

const CustomersTable = (props: CustomersTableProps) => {
  const { customers, handleEditUser } = props;

  const isBigScreen = useMediaQuery({ query: "(min-width: 640px)" });
  const isMobileScreen = useMediaQuery({ query: "(max-width: 639px)" });

  return (
    <>
      {isBigScreen && (
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Email
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {customers.map((person, i) => (
              <tr key={i}>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                  {person.firstName} {person.lastName}
                  <dl className="font-normal">
                    <dt className="sr-only">Title</dt>
                    <dd className="mt-1 truncate text-gray-700">
                      {person.title}
                    </dd>
                    <dt className="sr-only">Email</dt>
                    <dd className="mt-1 truncate text-gray-500">
                      {person.country}
                    </dd>
                  </dl>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {person.email}
                </td>
                <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                  {/* <span
                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                    onClick={() => handleEditUser(person)}
                  >
                    Edit
                  </span> */}
                  <div className="flex justify-center items-center gap-x-8">
                    <span className="cursor-pointer" onClick={() => handleEditUser(person)}>
                      <IconContext.Provider value={{ className:"text-indigo-600" ,size: "1rem" }} >
                        <FaPen />
                      </IconContext.Provider>
                    </span>
                    <span className="cursor-pointer">
                      <IconContext.Provider value={{ className:"text-red-500" ,size: "1rem" }} >
                        <FaTrashAlt />
                      </IconContext.Provider>
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isMobileScreen && (
        <div className="w-[90%]">
          <div className="flex items-center border-b-2 border-b-grey-300 pb-3">
            <span className="text-md font-medium">Customers List</span>
          </div>
          <div className="flex flex-col">
            {customers.map((person, i) => (
              <div
                key={i}
                className="flex justify-between py-3 border-b-2 border-b-grey-300"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {person.firstName} {person.lastName} <br />
                    {person.email}
                  </span>
                  <span className="text-xs">
                    {person.title} <br /> {person.country}
                  </span>
                </div>
                <div className="flex justify-center items-center">
                  <span
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer"
                    onClick={() => handleEditUser(person)}
                  >
                    Edit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomersTable;
