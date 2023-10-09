import { useEffect, useState } from "react";
import FormModal from "./FormModal";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import CustomersTable from "./CustomersTable";
import { IconContext } from "react-icons"
import { AiOutlineClear } from 'react-icons/ai'
import DeletePopup from "./DeletePopup";

export type Customer = Record<
  "id" | "firstName" | "lastName" | "title" | "email" | "country",
  string
>;

type FetchResult = {
  data: Customer[];
  lastPageNumber: number;
};

const API_BASE_URL = "http://localhost:4000";

const fetchCustomers = async (text:string, page: number = 1) => {
  const { data, headers } = await axios.get(
    API_BASE_URL + `/customers?q=${text}&_page=${page}`
  );

  const headersLink = headers.link
  const lastPageNumber = !!headersLink ? Number(
    headersLink.match(/_page=(\d+)>; rel="last"/)[1]
  ) : 0;
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
  const [text, setText] = useState('')
  const [isDelete, setIsDelete] = useState(false)
  const [deleteUser, setDeleteUser] = useState<Customer | null>(null);

  const { isLoading, isError, isSuccess, data } = useQuery({
    queryKey: ["customers", text, page],
    queryFn: () => fetchCustomers(text, page),
    keepPreviousData: true,
  });

  useEffect(() => {
    if(isError) {
      setCustomers([])
      setTotalPage(0);  
    }
    else if (isSuccess) {
      setCustomers(data.data);
      setTotalPage(data.lastPageNumber);
    }
  }, [isLoading, isError, isSuccess, data]);

  useEffect(() => {
    setPage(1)
  }, [text])

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

  const handleDeletePopup = () => {
    setIsDelete(!isDelete)
    setDeleteUser(null);
  }

  const handleDeleteUser = (user: Customer) => {
    setIsDelete(!isDelete)
    setDeleteUser(user);
  }

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
        <div className="flex justify-center items-center mt-4 gap-4">
          <input 
            id="search-customers"
            className="block w-full placeholder:italic placeholder:pl-1 rounded-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search... ex. customer name, email, etc."
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="cursor-pointer" onClick={() => setText('')}>
            <IconContext.Provider value={{ className:"hover:text-red-500", size: "1.5rem" }} >
              <AiOutlineClear />
            </IconContext.Provider>
          </div>
        </div>

        <div className="-mx-4 mt-4 sm:-mx-0 flex flex-col justify-between items-center h-full">
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

          {customers.length > 0 && (<CustomersTable customers={customers} handleEditUser={handleEditUser} handleDeleteUser={handleDeleteUser}/>)}

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
              forcePage={page-1}
              onPageChange={handleChangePage}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={totalPage}
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
            <FormModal userData={editUser} toggle={handleFormModal} />
          ) : (
            <FormModal toggle={handleFormModal} />
          )
        ) : null}

        {isDelete && deleteUser && (<DeletePopup userData={deleteUser} toggle={handleDeletePopup}/>) }
      </div>
    </div>
  );
};

export default Example;
