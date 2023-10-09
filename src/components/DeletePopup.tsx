import { useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { IconContext } from "react-icons";
import { PiWarningBold } from "react-icons/pi";
import { Customer } from "./Work";

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
        className="bg-white p-6 rounded-xl shadow-lg sm:w-[450px] sm:h-[450px] mx-auto"
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          e.stopPropagation()
        }
      >
        <div className="flex flex-col justify-end items-center h-full">
          <div className="">
            <IconContext.Provider
              value={{ className: "text-amber-500", size: "8rem" }}
            >
              <PiWarningBold />
            </IconContext.Provider>
          </div>
          <div className="flex flex-col justify-center items-center py-6 gap-y-3 border-b-2 border-b-slate-300 w-full">
            <div className="text-lg">Are you sure, to delete this customer</div>
            <div className="text-xl font-medium">
              {userData.firstName} {userData.lastName}
            </div>
          </div>
          <div className="flex justify-center items-center gap-x-4 pt-4 px-4 mt-4 w-full">
            <button
              type="button"
              className="block rounded-md bg-white px-3 py-3 w-full text-center text-red-600 text-lg font-medium shadow-sm border border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              onClick={handleSubmitDelete}
            >
              Delete
            </button>
            <button
              type="button"
              className="block rounded-md bg-white px-3 py-3 w-full text-center text-lg font-semibold shadow-sm border border-black hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
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
