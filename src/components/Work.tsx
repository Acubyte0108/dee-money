import { useEffect, useState } from "react";
import FormModal from "./FormModal";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import CustomersTable from "./CustomersTable";

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
  const [totalPage, setTotalPage] = useState(0);

  const { isLoading, isError, isSuccess, data } = useQuery({
    queryKey: ["customers", page],
    queryFn: () => fetchCustomers(page),
    keepPreviousData: true,
  });

  useEffect(() => {
    if(isError) {
      setCustomers([])
    }
    else if (isSuccess) {
      setCustomers(data.data);
      setTotalPage(data.lastPageNumber);  
    }
  }, [data, isLoading, isError]);

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

    window.scrollTo(0, 0);
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:px-8 h-screen">
      <div className="mx-auto max-w-3xl flex flex-col h-full">
        <div className="flex justify-between items-center">
          <div className="sm:flex-auto">
            <img src="/deemoney-logo.webp" className="h-8" />
          </div>
          <div className="sm:ml-16 sm:mt-4 sm:flex-none">
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
          {isLoading && (
            <div className="my-auto text-lg">
              ...Loading
            </div>
          )}

          {isError && (
            <div className="my-auto text-lg text-red-600 w-full text-center py-10 rounded-md bg-red-100">
              Failed to fetch customers list
            </div>
          )}

          {customers.length > 0 && (<CustomersTable customers={customers} handleEditUser={handleEditUser}/>)}

          {totalPage !== 0 && (<div>
            <ReactPaginate
              breakLabel={<span className="sm:mx-2 mx-0.5">...</span>}
              nextLabel={
                <span
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 hover:rounded-md"
                >
                  <BsChevronRight />
                </span>
              }
              onPageChange={handleChangePage}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={50}
              previousLabel={
                <span
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 hover:rounded-md"
                >
                  <BsChevronLeft />
                </span>
              }
              containerClassName="flex items-center justify-center mt-8 mb-4"
              pageClassName="block font-medium bg-transparent w-10 h-10 flex items-center justify-center hover:border-b-2 hover:border-b-2-gray-500 sm:mx-2 mx-0.5"
              activeClassName="text-indigo-600 border-b-2 border-b-indigo-600"
            />
          </div>
          )}  
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
