import { useEffect, useState } from "react";
import FormModal from "./FormModal";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export type Customer = Record<
  "id" | "firstName" | "lastName" | "title" | "email" | "country",
  string
>;

const API_BASE_URL = "http://localhost:4000";

const Example = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editUser, setEditUser] = useState<Customer | null>(null);
  const [page, setPage] = useState(0)
  const [totalPage, setTotalPage] = useState(1)

  const fetchCustomers = async (page:number = 1) => {
    try {
      const { data, headers } = await axios.get(API_BASE_URL + "/customers?_page=" + page);
      setCustomers(data)
      
      const lastPageNumber = Number(headers.link.match(/_page=(\d+)>; rel="last"/)[1]);
      setTotalPage(lastPageNumber)
    } catch (error) {
        console.log("Error:", error);
    }
  }

  // const { isLoading, isError, error, data, isFetching, isPreviousData } = useQuery({
  //   queryKey: ['customers', page],
  //   queryFn: () => fetchCustomers(page),
  //   keepPreviousData : true
  // })

  useEffect(() => {
    // fetch(API_BASE_URL + "/customers")
    //   .then((result) => result.json())
    //   .then((customers) => setCustomers(customers));

    fetchCustomers()
  }, []);

  // useEffect(() => {
  //   // fetch(API_BASE_URL + "/customers")
  //   //   .then((result) => result.json())
  //   //   .then((customers) => setCustomers(customers));
  //   fetchCustomers()
  // }, [isOpen]);

  const handleFormModal = () => {
    setIsOpen(!isOpen);
    setEditUser(null);
  };

  const handleEditUser = (user: Customer) => {
    setIsOpen(true);
    setEditUser(user);
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <img src="/deemoney-logo.webp" className="h-8" />
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={handleFormModal}
            >
              Add Customer
            </button>
          </div>
        </div>

        <div className="-mx-4 mt-8 sm:-mx-0">
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
                    <a
                      href="#"
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEditUser(person)}
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isOpen ? (
          editUser ? (
            <FormModal userData={editUser} toggle={handleFormModal} />
          ) : (
            <FormModal toggle={handleFormModal} />
          )
        ) : null}
      </div>
    </div>
  );
};

export default Example;
