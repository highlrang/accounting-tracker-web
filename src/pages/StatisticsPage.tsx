import React, { useState, useEffect, useRef } from 'react';
import { fetchSettlements } from '../api';
import { Settlement } from '../types';

interface AggregatedStat {
  period: string;
  count: number;
  amount: number;
}

const ITEMS_PER_PAGE = 20;

function StatisticsPage() {
  const [data, setData] = useState<Settlement[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isCalculatingStats, setIsCalculatingStats] = useState<boolean>(false);

  const getFormattedDate = (type: 'daily' | 'monthly' | 'yearly', date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    if (type === 'monthly') {
      return `${year}-${month}`;
    } else if (type === 'yearly') {
      return year.toString();
    } else {
      return `${year}-${month}-${day}`;
    }
  };

  const today = new Date();

  const [tempCompanyFilter, setTempCompanyFilter] = useState('');
  const [tempPaidFilter, setTempPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [tempStartDate, setTempStartDate] = useState(getFormattedDate(period, today));
  const [tempEndDate, setTempEndDate] = useState(getFormattedDate(period, today));

  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStat[]>([]);

  // States for infinite scroll on the aggregated stats table
  const [displayedStats, setDisplayedStats] = useState<AggregatedStat[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    fetchSettlements({ limit: 100000 }).then(({ settlements }) => {
      setData(settlements);
      setInitialLoading(false);
    });
  }, []);

  const handleSearch = () => {
    setIsCalculatingStats(true);
    setStartDateFilter(tempStartDate);
    setEndDateFilter(tempEndDate);
    setCompanyFilter(tempCompanyFilter);
    setPaidFilter(tempPaidFilter);
  };

  useEffect(() => {
    if (initialLoading) return;

    let result = data;

    if (startDateFilter) {
      if (period === 'yearly') {
        result = result.filter(item => item.date >= `${startDateFilter}-01-01`);
      } else if (period === 'monthly') {
        result = result.filter(item => item.date >= `${startDateFilter}-01`);
      } else {
        result = result.filter(item => item.date >= startDateFilter);
      }
    }
    if (endDateFilter) {
      if (period === 'yearly') {
        result = result.filter(item => item.date <= `${endDateFilter}-12-31`);
      } else if (period === 'monthly') {
        result = result.filter(item => item.date <= `${endDateFilter}-31`);
      } else {
        result = result.filter(item => item.date <= endDateFilter);
      }
    }
    if (companyFilter) {
      result = result.filter(item => item.company.toLowerCase().includes(companyFilter.toLowerCase()));
    }
    if (paidFilter !== 'all') {
      result = result.filter(item => (paidFilter === 'paid' ? item.paid : !item.paid));
    }

    setTotalCount(result.length);
    setTotalAmount(result.reduce((sum, item) => sum + item.amount, 0));

    const statsMap = new Map<string, { count: number; amount: number }>();
    result.forEach(item => {
      let key = '';
      if (period === 'daily') {
        key = item.date;
      } else if (period === 'monthly') {
        key = item.date.substring(0, 7);
      } else {
        key = item.date.substring(0, 4);
      }

      if (!statsMap.has(key)) {
        statsMap.set(key, { count: 0, amount: 0 });
      }
      const currentStats = statsMap.get(key)!;
      currentStats.count++;
      currentStats.amount += item.amount;
    });

    const sortedStats = Array.from(statsMap.entries())
      .map(([key, value]) => ({ period: key, count: value.count, amount: value.amount }))
      .sort((a, b) => a.period.localeCompare(b.period));

    setAggregatedStats(sortedStats);
    setDisplayedStats(sortedStats.slice(0, ITEMS_PER_PAGE));
    setCurrentPage(1);
    setHasMore(sortedStats.length > ITEMS_PER_PAGE);
    setIsCalculatingStats(false);
  }, [startDateFilter, endDateFilter, companyFilter, paidFilter, data, period, initialLoading]);

  // Effect for IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          setCurrentPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isFetchingMore]);

  // Effect to load more stats when page changes
  useEffect(() => {
    if (currentPage > 1) {
      setIsFetchingMore(true);
      setTimeout(() => { // Simulate network delay for loading more stats
        const newDisplayedStats = aggregatedStats.slice(
          0,
          currentPage * ITEMS_PER_PAGE
        );
        setDisplayedStats(newDisplayedStats);
        setHasMore(currentPage * ITEMS_PER_PAGE < aggregatedStats.length);
        setIsFetchingMore(false);
      }, 500);
    }
  }, [currentPage, aggregatedStats]);


  const handlePeriodChange = (newPeriod: 'daily' | 'monthly' | 'yearly') => {
    setPeriod(newPeriod);
    const today = new Date();
    setTempStartDate(getFormattedDate(newPeriod, today));
    setTempEndDate(getFormattedDate(newPeriod, today));
  };

  const renderDateInputs = () => {
    switch (period) {
      case 'monthly':
        return (
          <>
            <input 
              type="month" 
              className="search-input" 
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
            />
            <input 
              type="month" 
              className="search-input" 
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
            />
          </>
        );
      case 'yearly':
        return (
          <>
            <input 
              type="number" 
              placeholder="시작년도"
              className="search-input" 
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="종료년도"
              className="search-input" 
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
            />
          </>
        );
      default: // daily
        return (
          <>
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
          </>
        );
    }
  };

  if (initialLoading) {
    return (
      <div>
        {/* <div className="page-header">
        </div> */}
        {/* <p>로딩중...</p> */}
      </div>
    );
  }

  return (
    <div>
      {/* <div className="page-header">
      </div> */}
      <div className="search-bar">
        <div className="search-bar-row">
          <select 
            className="filter-select" 
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value as 'daily' | 'monthly' | 'yearly')}
          >
            <option value="daily">일별</option>
            <option value="monthly">월별</option>
            <option value="yearly">년별</option>
          </select>
        </div>
        <div className="search-bar-row">
          {renderDateInputs()}
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
          <button className="search-button button-primary" onClick={handleSearch} disabled={isCalculatingStats}>
            검색 {isCalculatingStats && <div className="loading-spinner"></div>}
          </button>
        </div>
      </div>
      <div className="statistics-results">
        <p>총 건수: <strong>{totalCount}</strong> 건</p>
        <p>총 금액: <strong>{totalAmount.toLocaleString('ko-KR')}</strong> 원</p>

        {displayedStats.length > 0 && (
          <table className="settlement-table">
            <thead>
              <tr>
                <th>기간</th>
                <th>건수</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {displayedStats.map((stat) => (
                <tr key={stat.period}>
                  <td data-label="기간">{stat.period}</td>
                  <td data-label="건수">{stat.count} 건</td>
                  <td data-label="금액">{stat.amount.toLocaleString('ko-KR')} 원</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {isFetchingMore && (
          <div style={{textAlign: 'center', padding: '1rem'}}>
            <div className="loading-spinner"></div>
            {/* <p>로딩 중...</p> */}
          </div>
        )}
        {!hasMore && displayedStats.length > 0 && (
          <p style={{textAlign: 'center', padding: '1rem', color: '#777'}}>모든 항목을 불러왔습니다.</p>
        )}
        <div ref={observerTarget} style={{ height: '1px', margin: '1rem 0' }}></div>

        {aggregatedStats.length === 0 && !isCalculatingStats && (
          <p>데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default StatisticsPage;