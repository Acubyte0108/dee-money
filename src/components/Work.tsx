import { useEffect, useState } from "react";
import FormModal from "./FormModal";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export type Customer = Record<
  "id" | "firstName" | "lastName" | "title" | "email" | "country",
  string
>;

type FetchResult = {
  data: Customer[];
  lastPageNumber: number;
};

const API_BASE_URL = "http://localhost:4000";

const fetchCustomers = async (page: number = 1) => {
  const { data, headers } = await axios.get(
    API_BASE_URL + "/customers?_page=" + page
  );
  const lastPageNumber = Number(
    headers.link.match(/_page=(\d+)>; rel="last"/)[1]
  );

  const result: FetchResult = {
    data,
    lastPageNumber,
  };
  return result;
};

const Example = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editUser, setEditUser] = useState<Customer | null>(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const { isLoading, isError, data, refetch } = useQuery({
    queryKey: ["customers", page],
    queryFn: () => fetchCustomers(page),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (isLoading) {
      console.log("Loading...");
    } else if (isError) {
      console.log("Error fetching customers");
    } else {
      setCustomers(data.data);
      setTotalPage(data.lastPageNumber);
    }
  }, [data, isLoading, isError, page]);

  useEffect(() => {
    refetch()
  }, [isOpen])

  const handleFormModal = () => {
    setIsOpen(!isOpen);
    setEditUser(null);
  };

  const handleEditUser = (user: Customer) => {
    setIsOpen(true);
    setEditUser(user);
  };

  const handleChangePage = ({ selected }: { selected: number }) => {
    const seletedPage = selected + 1;
    setPage(seletedPage);
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:px-8 h-screen">
      <div className="mx-auto max-w-3xl flex flex-col h-full">
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

        <div className="-mx-4 mt-8 sm:-mx-0 flex flex-col justify-between items-center h-full">
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

          <div>
            <ReactPaginate
              breakLabel={<span className="mx-2">...</span>}
              nextLabel={
                <span
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 hover:rounded-md"
                >
                  <BsChevronRight />
                </span>
              }
              onPageChange={handleChangePage}
              pageRangeDisplayed={5}
              pageCount={totalPage}
              previousLabel={
                <span
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 hover:rounded-md"
                >
                  <BsChevronLeft />
                </span>
              }
              containerClassName="flex items-center justify-center mt-8 mb-4"
              pageClassName="block bg-transparent w-10 h-10 flex items-center justify-center hover:border-b hover:border-b-gray-500 mx-2"
              activeClassName="text-indigo-600 border-b border-b-indigo-600"
            />
          </div>
        </div>

        {isOpen ? (
          editUser ? (
            <FormModal userData={editUser} page={page} toggle={handleFormModal} />
          ) : (
            <FormModal toggle={handleFormModal} />
          )
        ) : null}
      </div>
    </div>
  );
};

export default Example;
