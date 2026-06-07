import axios from "axios";

export const getFY = async (company) =>
    await axios.get(
        "/fiscal-years",
        {
            params: {
                company
            }
        }
    );

export const createFY = async (data) =>
    await axios.post(
        "/fiscal-years",
        data
    );

export const closeFY = async (id) =>
    await axios.patch(
        `/fiscal-years/close/${id}`
    );

export const reopenFY = async (id) =>
    await axios.patch(
        `/fiscal-years/reopen/${id}`
    );