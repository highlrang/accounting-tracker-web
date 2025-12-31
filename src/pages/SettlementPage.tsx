import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../App.css';
import { fetchSettlements, addSettlements as apiAddSettlements, updateSettlement as apiUpdateSettlement, updateSettlementsStatus as apiUpdateSettlementsStatus, deleteSettlement as apiDeleteSettlement } from '../api';
import { Settlement } from '../types';
import Modal from '../components/Modal';
import AddSettlementForm from '../components/AddSettlementForm';
import UpdateSettlementForm from '../components/UpdateSettlementForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const ITEMS_PER_PAGE = 10; // Define items per page for infinite scroll

function SettlementPage() {
  const [data, setData] = useState<Settlement[]>([]); // Data currently displayed (paginated)
  const [allFilteredData, setAllFilteredData] = useState<Settlement[]>([]); // All data matching filters (for selection)
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false); // For infinite scroll loading
  const [isUpdating, setIsUpdating] = useState<boolean>(false); // For add/update/bulk operations
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [settlementToDelete, setSettlementToDelete] = useState<number | null>(null);

  const getFormattedDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Filter states for UI
  const [tempStartDate, setTempStartDate] = useState(getFormattedDate(oneYearAgo));
  const [tempEndDate, setTempEndDate] = useState(getFormattedDate(today));
  const [tempCompanyFilter, setTempCompanyFilter] = useState('');
  const [tempPaidFilter, setTempPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Committed filter states for filtering logic
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const observerTarget = useRef(null);

  const loadData = useCallback(async (page: number, append: boolean, showLoadingSpinner: boolean) => {
    if (showLoadingSpinner) {
      if (append) setIsFetchingMore(true);
      else setIsUpdating(true);
    }

    try {
      const { settlements, totalCount: newTotalCount } = await fetchSettlements({
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        startDate: startDateFilter,
        endDate: endDateFilter,
        company: companyFilter,
        paidStatus: paidFilter,
      });

      if (append) {
        setData(prevData => [...prevData, ...settlements]);
      } else {
        setData(settlements);
      }
      setTotalCount(newTotalCount);
      setHasMore(settlements.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
      // Handle error display
    } finally {
      setInitialLoading(false);
      setIsFetchingMore(false);
      setIsUpdating(false);
    }
  }, []);

  // Effect for initial load and filter changes
  useEffect(() => {
    setInitialLoading(true); // Show full page loading for initial load or new search
    setCurrentPage(1); // Reset page to 1 on filter/search change
    loadData(1, false, true); // Load first page, replace data, show loading spinner
  }, [startDateFilter, endDateFilter, companyFilter, paidFilter, loadData]);

  // Effect for fetching more data on page increment (infinite scroll)
  useEffect(() => {
    if (currentPage > 1) { // Only fetch more if page number is incremented after initial load
      loadData(currentPage, true, true); // Append data, show fetching more spinner
    }
  }, [currentPage, loadData]);

  // Effect for IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isUpdating && !initialLoading) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, { threshold: 1.0 });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isFetchingMore, isUpdating, initialLoading]);

  // Effect to update allFilteredData for selection logic
  useEffect(() => {
    // This fetches all filtered data without pagination, to correctly handle select all checkbox
    // In a real API, this might be a separate endpoint or a paginated call that fetches more aggressively.
    fetchSettlements({
      startDate: startDateFilter,
      endDate: endDateFilter,
      company: companyFilter,
      paidStatus: paidFilter,
      limit: 100000, // Fetch all if totalCount is known
      offset: 0,
    }).then(({ settlements }) => {
      setAllFilteredData(settlements);
    }).catch(error => console.error("Error fetching all filtered data:", error));
  }, [startDateFilter, endDateFilter, companyFilter, paidFilter, totalCount]);


  const handleSearch = () => {
    setCurrentPage(1); // Reset page on new search
    setStartDateFilter(tempStartDate);
    setEndDateFilter(tempEndDate);
    setCompanyFilter(tempCompanyFilter);
    setPaidFilter(tempPaidFilter);
  };

  const handleAddSettlement = (newSettlements: Omit<Settlement, 'id'>[]) => {
    apiAddSettlements(newSettlements).then(() => {
      loadData(1, false, true); // Reload first page after add operation
    });
  };

  const handleUpdateSettlement = (updatedSettlement: Settlement) => {
    apiUpdateSettlement(updatedSettlement).then(() => {
      loadData(1, false, true); // Reload first page after update operation
    });
  };

  const handleBulkUpdateStatus = (paidStatus: boolean) => {
    if (selectedItems.length === 0) return;
    
    apiUpdateSettlementsStatus(selectedItems, paidStatus).then(() => {
      loadData(1, false, true); // Reload first page after bulk update
    });
  }

  const openDeleteModal = (id: number) => {
    setSettlementToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (settlementToDelete !== null) {
      apiDeleteSettlement(settlementToDelete).then(() => {
        loadData(1, false, true); // Reload data after deletion
      });
    }
    setIsDeleteModalOpen(false);
    setSettlementToDelete(null);
  };

  const openUpdateModal = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setIsUpdateModalOpen(true);
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = allFilteredData.map(item => item.id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const isAllSelected = allFilteredData.length > 0 && selectedItems.length === allFilteredData.length;

  if (initialLoading) {
    // return <div className="container"><h1>로딩중...</h1></div>;
  }

  return (
    <div>
      {/* <div className="page-header">
      </div> */}
      <div className="search-bar">
        <div className="search-bar-row">
          <input 
            type="date" 
            className="search-input" 
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
          />
          <input 
            type="date" 
            className="search-input" 
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
          />
        </div>
        <div className="search-bar-row">
          <input 
            type="text" 
            placeholder="기업명으로 검색" 
            className="search-input" 
            value={tempCompanyFilter}
            onChange={(e) => setTempCompanyFilter(e.target.value)}
          />
          <select
            className="filter-select"
            value={tempPaidFilter}
            onChange={(e) => setTempPaidFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
          >
            <option value="all">입금여부 (전체)</option>
            <option value="paid">입금완료</option>
            <option value="unpaid">미입금</option>
          </select>
        </div>
        <div className="search-bar-actions">
          <button className="search-button button-primary" onClick={handleSearch} disabled={isUpdating}>
            검색 {isUpdating && <div className="loading-spinner"></div>}
          </button>
        </div>
      </div>

      <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end'}}>
        <button 
          className="button-primary" 
          onClick={() => setIsAddModalOpen(true)}
        >
          항목 추가
        </button>
      </div>

      <table className="settlement-table">
        <thead>
          <tr>
            <th>순번</th>
            <th>날짜</th>
            <th>회사명</th>
            <th>금액</th>
            <th>입금여부</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} onClick={() => openUpdateModal(item)} className="clickable-row">
              <td data-label="순번">{index + 1}</td>
              <td data-label="날짜">{item.date}</td>
              <td data-label="회사명">{item.company}</td>
              <td data-label="금액">{item.amount.toLocaleString('ko-KR')}원</td>
              <td data-label="입금여부">
                <span className={item.paid ? 'status-paid' : 'status-unpaid'}>
                  {item.paid ? '입금완료' : '미입금'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isFetchingMore && (
        <div style={{textAlign: 'center', padding: '1rem'}}>
          <div className="loading-spinner" style={{borderColor: '#3498db', borderTopColor: 'transparent'}}></div>
          {/* <p>로딩 중...</p> */}
        </div>
      )}
      {!hasMore && data.length > 0 && (
        <p style={{textAlign: 'center', padding: '1rem', color: '#777'}}>모든 항목을 불러왔습니다.</p>
      )}
      <div ref={observerTarget} style={{ height: '1px', margin: '1rem 0' }}></div> {/* Invisible target for observer */}
      
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <AddSettlementForm 
          onAdd={handleAddSettlement}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>
      {selectedSettlement && (
        <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)}>
          <UpdateSettlementForm
            settlement={selectedSettlement}
            onUpdate={handleUpdateSettlement}
            onDelete={openDeleteModal}
            onClose={() => setIsUpdateModalOpen(false)}
          />
        </Modal>
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default SettlementPage;