import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import regex from "../constants/regex";
import { Customer } from "./Work";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { IconContext } from "react-icons"
import { ImCancelCircle } from 'react-icons/im'

const API_BASE_URL = "http://localhost:4000";

type FormModalProps = {
  userData?: Customer;
  toggle: () => void;
};

const UserSchema = z.object({
  firstName: z
    .string()
    .min(1, "Please fill the first name")
    .regex(regex.englishCharacterOnly, {
      message: "Must only contain English alphabets",
    })
    .regex(regex.capitalFirst, {
      message: "First character must be capitalized and not symbols",
    })
    .regex(regex.containsOneSymbol, {
      message: "Can contain only 1 of these ( ' . - ) symbol per word",
    })
    .refine((value) => !regex.specialWhitespace.test(value), {
      message: "Wrong spacebar format",
    }),
  lastName: z
    .string()
    .min(1, "Please fill the last name")
    .regex(regex.englishCharacterOnly, {
      message: "Must only contain English alphabets",
    })
    .regex(regex.capitalFirst, {
      message: "First character must be capitalized and not symbols",
    })
    .regex(regex.containsOneSymbol, {
      message: "Can contain only 1 of these ( ' . - ) symbol per word",
    })
    .refine((value) => !regex.specialWhitespace.test(value), {
      message: "Wrong spacebar format",
    }),
  email: z.string().min(1, "Please fill the email address").email(),
  title: z.string().min(1, "Please select title"),
  country: z.string().min(1, "Please select country"),
});

type TUserSchema = z.infer<typeof UserSchema>

const FormModal = (props: FormModalProps) => {
  const [titles, setTitles] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]); 
  const { userData, toggle } = props
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TUserSchema>({
    resolver: zodResolver(UserSchema),
  });

  const getOptionsData = async () => {
    await axios
      .get(API_BASE_URL + "/countries")
      .then(({ data }) => {
        setCountries(data);
      })
      .catch((error) => {
        console.log("Error:", error);
      });

    await axios
      .get(API_BASE_URL + "/titles")
      .then(({ data }) => {
        setTitles(data);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  useEffect(() => {
    getOptionsData();

    if (userData) {
      setValue("firstName", userData.firstName);
      setValue("lastName", userData.lastName);
      setValue("email", userData.email);
    }

    document.body.style.overflow = "hidden";

    return () => {
      setTitles([]);
      setCountries([]);
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (!userData && countries.length > 0) {
      setValue("title", titles[0]);
      setValue("country", countries[0]);
    } else if (userData && countries.length > 0) {
      setValue("title", userData.title);
      setValue("country", userData.country);
    }
  }, [titles, countries]);

  const mutation = useMutation<AxiosResponse, Error, TUserSchema>(
    async (data: TUserSchema) => {
      if (userData) {
        const response = await axios.patch(
          API_BASE_URL + "/customers/" + userData.id,
          data
        );
        return response;
      } else {
        const response = await axios.post(API_BASE_URL + "/customers", data);
        return response;
      }
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ stale: true })
        toggle();
      },
      onError: (error) => {
        console.log("Error:", error);
      },
    }
  );

  const onSubmit = async (data: TUserSchema) => {
    mutation.mutate(data)
  };

  return (
    <div
      className="fixed bg-gray-800 bg-opacity-75 inset-0 flex items-center justify-center z-10"
      onClick={toggle}
    >
      <div
        className="bg-white p-6 rounded shadow-lg lg:w-[900px] mx-auto relative max-sm:w-4/5"
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          e.stopPropagation()
        }
      >
        {mutation.isError && (<div className="text-lg text-red-600 rounded-md bg-red-100 absolute text-center sm:w-2/5 w-fit sm:py-3 py-2 sm:px-0 px-4 sm:top-2 top-4 sm:left-1/2 left-4 sm:-translate-x-1/2">
            Failed to summit the form
          </div>
        )}
        <div className="flex justify-center items-center w-10 h-10 absolute sm:top-4 sm:right-4 top-2 right-2 cursor-pointer" onClick={toggle}>
          <IconContext.Provider value={{ className:"hover:text-red-500", size: "1.5rem" }} >
            <ImCancelCircle />
          </IconContext.Provider>
        </div>
        <form className="" onSubmit={handleSubmit(onSubmit)}>
          <div className="pb-12 mt-12 max-sm:pb-0 max-sm:mt-0">
            <h2 className="text-xl font-semibold leading-7 text-gray-900">
              {userData ? `Edit Customer` : `Add Customer`}
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 max-sm:gap-y-2 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    {...register("firstName")}
                    type="text"
                    id="first-name"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 mt-1 sm:text-base text-sm">{`${errors.firstName.message}`}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    {...register("lastName")}
                    type="text"
                    id="last-name"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 mt-1 sm:text-base text-sm">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    {...register("email")}
                    id="email"
                    type="text"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  {errors.email && (
                    <p className="text-red-500 mt-1 sm:text-base text-sm">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Title
                </label>
                <div className="mt-2">
                  <select
                    {...register("title")}
                    id="title"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    {titles.map((title, i) => (
                      <option key={`${title}-${i}`} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                  {errors.title && (
                    <p className="text-red-500 mt-1 sm:text-base text-sm">{errors.title.message}</p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Country
                </label>
                <div className="mt-2">
                  <select
                    {...register("country")}
                    id="country"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    {countries.map((country, i) => (
                      <option key={`${country}-${i}`} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 mt-1 sm:text-base text-sm">{errors.country.message}</p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="block rounded-md bg-indigo-600 px-3 py-2 max-sm:mt-4 text-center text-sm font-semibold w-full sm:w-fit text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
