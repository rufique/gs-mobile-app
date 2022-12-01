import { useEffect, useState } from "react";

const useDebounce = (value, duration) => {

    const [ val, setValue ] = useState(value);
    const [ debouncedValue, setDebouncedValue ] = useState();

    console.log(val)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(val);
        }, duration)

        return () => {
            clearTimeout(timeout)
        }
    },[val, duration]);

    return [debouncedValue, setValue];
}

export default useDebounce;