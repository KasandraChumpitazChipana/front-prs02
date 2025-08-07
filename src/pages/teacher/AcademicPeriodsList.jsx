import React, { useState, useEffect } from 'react';
import { Table, pagination } from "antd";
import { onShowSizeChange, itemRender } from '../Pagination';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, refreshicon, searchnormal } from '../imagepath';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react/build/FeatherIcon';
import AcademicPeriodsService from '../../services/academicPeriods.service';

const AcademicPeriodsList = ({ institutionId }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        setLoading(true);
        const data = institutionId
          ? await AcademicPeriodsService.getByInstitutionId(institutionId)
          : await AcademicPeriodsService.getAll();
        setPeriods(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriods();
  }, [institutionId]);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: "Period Name",
      dataIndex: "periodName",
      sorter: (a, b) => a.periodName.length - b.periodName.length,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (text, record) => new Date(record.startDate).toLocaleDateString(),
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (text, record) => new Date(record.endDate).toLocaleDateString(),
      sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status.length - b.status.length,
    },
    {
      title: "",
      dataIndex: "action",
      render: (text, record) => (
        <>
          <div className="text-end">
            <div className="dropdown dropdown-action">
              <Link
                to="#"
                className="action-icon dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-ellipsis-v" />
              </Link>
              <div className="dropdown-menu dropdown-menu-end">
                <Link className="dropdown-item" to="/edit-academic-period">
                  <i className="far fa-edit me-2" />
                  Edit
                </Link>
                <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#delete_academic_period">
                  <i className="fa fa-trash-alt m-r-5"></i> Delete
                </Link>
              </div>
            </div>
          </div>
        </>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Header />
      <Sidebar id='menu-item1' id1='menu-items1' activeClassName='academic-periods-list' />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Academic Periods</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FeatherIcon icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Academic Periods List</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3>Academic Periods List</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <form>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Search here"
                                />
                                <Link className="btn">
                                  <img src={searchnormal} alt="#" />
                                </Link>
                              </form>
                            </div>
                            <div className="add-group">
                              <Link to="/add-academic-period" className="btn btn-primary add-pluss ms-2">
                                <img src={plusicon} alt="#" />
                              </Link>
                              <Link to="#" className="btn btn-primary doctor-refresh ms-2">
                                <img src={refreshicon} alt="#" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto text-end float-end ms-auto download-grp">
                        <Link to="#" className="me-2">
                          <img src={pdficon} alt="#" />
                        </Link>
                        <Link to="#" className="me-2">
                          <img src={pdficon3} alt="#" />
                        </Link>
                        <Link to="#">
                          <img src={pdficon4} alt="#" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <Table
                      pagination={{
                        total: periods.length,
                        showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                        onShowSizeChange: onShowSizeChange,
                        itemRender: itemRender,
                      }}
                      columns={columns}
                      dataSource={periods}
                      rowSelection={rowSelection}
                      rowKey={(record) => record.id}
                      style={{
                        backgroundColor: '#f2f2f2',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="delete_academic_period" className="modal fade delete-modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <img src={imagesend} alt="#" width={50} height={46} />
              <h3>Are you sure you want to delete this?</h3>
              <div className="m-t-20">
                <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">
                  Close
                </Link>
                <button type="submit" className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcademicPeriodsList;
