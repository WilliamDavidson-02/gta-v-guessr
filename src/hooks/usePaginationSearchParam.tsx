import { useSearchParams } from "react-router-dom";

export default function usePaginationSearchParam() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setNewPagination = (property: string, value: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(property, String(value));

    setSearchParams(newSearchParams);
  };

  return setNewPagination;
}
