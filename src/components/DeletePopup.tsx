import { useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { IconContext } from "react-icons";
import { PiWarningBold } from "react-icons/pi";
import { Customer } from "./Work";
import { ImCancelCircle } from 'react-icons/im'

const API_BASE_URL = "http://localhost:4000";

type DeletePopupProps = {
  userData: Customer;
  toggle: () => void;
};

const DeletePopup = (props: DeletePopupProps) => {
  const { userData, toggle } = props;
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, string>(
    async (customerId) => {
      const response = await axios.delete(
        API_BASE_URL + "/customers/" + customerId
      );
      return response;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ stale: true });
        toggle();
      },
      onError: (error) => {
        console.log("Error:", error);
      },
    }
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmitDelete = () => {
    const customerId = userData.id;
    // mutation.mutate(customerId)
  };

  return (
    <div
      className="fixed bg-gray-800 bg-opacity-75 inset-0 flex items-center justify-center z-10"
      onClick={toggle}
    >
      <div
        className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-[320px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[450px] lg:h-[450px] mx-auto relative"
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          e.stopPropagation()
        }
      >
        <div className="flex justify-center items-center w-10 h-10 absolute sm:top-4 sm:right-4 top-2 right-2 cursor-pointer" onClick={toggle}>
          <IconContext.Provider value={{ className:"hover:text-red-500", size: "1.5rem" }} >
            <ImCancelCircle />
          </IconContext.Provider>
        </div>
        {mutation.isError && (<div className="lg:text-lg sm:text-medium text-red-600 rounded-md bg-red-100 absolute text-center w-3/5 sm:w-3/5 lg:py-2 py-0.5 sm:py-1 lg:px-3 sm:px-0 top-4 sm:top-5 lg:top-4 sm:left-1/2 sm:-translate-x-1/2">
            Failed to delete customer
          </div>
        )}
        <div className="flex flex-col justify-end items-center h-full">
          <div>
            <IconContext.Provider
              value={{ className: "text-amber-500 text-[4rem] sm:text-[6rem] lg:text-[8rem]" }}
            >
              <PiWarningBold />
            </IconContext.Provider>
          </div>
          <div className="flex flex-col justify-center items-center lg:py-6 py-4 lg:gap-y-3 border-b-2 border-b-slate-300 w-full">
            <div className="sm:text-lg">Are you sure, to delete this customer</div>
            <div className="sm:text-xl font-medium">
              {userData.firstName} {userData.lastName}
            </div>
          </div>
          <div className="flex justify-center items-center lg:gap-x-4 gap-x-2 pt-4 lg:px-4 lg:mt-4 w-full">
            <button
              type="button"
              className="block rounded-md bg-white sm:p-3 p-1 w-full text-center text-red-600 text-lg font-medium shadow-sm border border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              onClick={handleSubmitDelete}
            >
              Delete
            </button>
            <button
              type="button"
              className="block rounded-md bg-white sm:p-3 p-1 w-full text-center text-lg font-semibold shadow-sm border border-black hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              onClick={toggle}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;
