import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SeachAndFilter from "../../../components/User/forum/SeachAndFilter";
import ThreadList from "../../../components/User/forum/ThreadList";
import { searchThreads } from "../../../redux/threadApi";
import "./SearchResultThreads.css";

const SearchResultThreads = () => {
    const location = useLocation();

    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        tags: '',
        sortBy: 'newest',
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const q = queryParams.get("q") || "";
        const t = queryParams.get("tags") || "";
        const s = queryParams.get("sort") || "newest";

        setSearchParams({ keyword: q, tags: t, sortBy: s });
        setPage(1);
    }, [location.search]);

    useEffect(() => {
        if (!searchParams.keyword.trim()) return;

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const response = await searchThreads({
                    keyword: searchParams.keyword,
                    tags: searchParams.tags,
                    sortBy: searchParams.sortBy,
                    page,
                    limit: 10,
                });
                setThreads(Array.isArray(response?.data?.data) ? response.data.data : []);
                setTotalPages(response?.data?.pagination?.total || 1);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            }
            setLoading(false);
        };

        fetchSearchResults();
    }, [searchParams, page]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleSearchChange = () => {
        setPage(1);
    };
    return (
        <div className="search-result-threads-container">
            <SeachAndFilter onSearchChange={handleSearchChange} />
            {!loading || threads.length > 0 ? (
                <ThreadList
                    threads={threads}
                    setThreads={setThreads}
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onThreadClick={(id) => console.log("Thread click:", id)}
                    onThreadUpdated={() => { }}
                    onThreadDeleted={() => { }}
                />
            ) : null}
        </div>
    );
};

export default SearchResultThreads;
