import React, { useEffect, useState } from 'react';
import { ResultContext } from '../context/ContextProvider';
import { SERVER_ERROR } from '../interface/Constant';
import FileService from '../services/FileService';
import Loader from './Loader';
import Icon from './svg/Icon';
import { useSubscription } from '@apollo/client';

const TABLE_HEADERS = ["Name", "Status", "Error File", "Log File", "Uploaded By", "Uploaded Date"]
const UPLOADED_FILE = "UPLOADED";
const ERROR_FILE = "ERROR";
const LOG_FILE = "LOG";

export default function Result() {
    const [isLoading, setLoader] = useState<boolean>(false)
    const [errorMsg, setErrorMsg] = useState<string>()
    const [isRefreshEnable, setRefreshEnable] = useState<boolean>(false)
    const { data } = useSubscription(FileService.NotificationSubscriberQuery, {});
    const { records, resetResult } = React.useContext(ResultContext)

    useEffect(() => {
        loadResult();
    }, [])

    useEffect(() => {
        if (data) {
            setRefreshEnable(true);
        }
    }, [data])


    const downloadFile = (fileType: string, recordId: string, fileName: string) => {
        FileService.downloadUploadFile(fileType, recordId, fileName);
    }

    const loadResult = () => {
        setLoader(true);
        FileService.getResult()
            .then(res => res.json())
            .then(res => {
                resetResult(res)
                setRefreshEnable(false);
                setLoader(false);

            }).catch(err => {
                setErrorMsg(SERVER_ERROR)
                setLoader(false);
            })
    }

    const refresh = () => {
        loadResult();
    }

    return (
        <div className="flex justify-center">
            <div className="py-2  w-full sm:px-2 md:px-2 lg:px-10  items-center">
                <div className="flex justify-between text-xl font-semibold p-2 text-white">
                    <div>Recent Files</div>
                    {isRefreshEnable &&
                        <button onClick={refresh} title="Refresh" className="animate-fade flex bg-blue-600 rounded p-2 text-sm" >
                            Updates
                            <svg className={`h-6 w-6 ml-2 text-white ${isLoading && 'animate-spin'}`} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" /></svg>
                        </button>
                    }
                </div>
                <div className="shadow-md bg-white">
                    <div className="grid  bg-white grid-cols-6 border sticky top-0 z-50 border-b-2 border-gray-100">

                        {TABLE_HEADERS.map((header) => (
                            <div key={header} className="table-header font-bold">
                                {header}
                            </div>
                        ))}
                    </div>
                    <Loader isLoading={isLoading} color="border-primary" classes="py-2 flex h-12 justify-center  w-full" />

                    {isResultEmpty() &&
                        <div className="grid grid-cols-1 text-center text-lg text-gray-500 py-4">
                            {errorMsg ? errorMsg : "No records found"}
                        </div>
                    }

                    <div className=" max-h-64 divide-y divide-gray-100 overflow-auto custome-scrollbar">
                        {!isResultEmpty() && records.map((record: any, index: number) => (
                            displayData(record, index)
                        ))}
                    </div>
                </div>
                <div className="h-2 bg-gray-200"></div>
            </div>

        </div>
    )


    function displayData(record: any, index: number) {
        return <div key={`${index}-${record.recordId}`} className="grid grid-cols-6 even:bg-gray-100">
            <div key={record.recordId} className="table-td flex-wrap" title={record.name}>
                <a href="#/" onClick={() => downloadFile(UPLOADED_FILE, record.id, record.fileName)} className="link">
                    {record.fileName}</a></div>
            <div className="table-td  ">
                <span className={getStatusColor(record)}>
                    {record.status}
                </span>
            </div>
            <div className={`table-td ${record.fileExist  && 'cursor-pointer'}`}>
                {record.fileExist ? <Icon.Download onClick={() => downloadFile(ERROR_FILE, record.id, record.fileName)} /> : "N/A"}
            </div>

            <div className={`table-td ${record.fileExist  && 'cursor-pointer'}`}>
                {record.fileExist ? <Icon.Download onClick={() => downloadFile(LOG_FILE, record.id, record.fileName)} /> : "N/A"}</div>
            <div className="table-td ">
                {record.uploadedBy}
            </div> <div className="table-td flex-wrap">
                {record.uploadedDate}
            </div>
        </div>
    }

    function getStatusColor(record: any): string {
        return `badge justify-center items-center  uppercase
                ${record.status.includes("SUCCESS") && 'bg-green-100 text-green-500'}
                ${record.status.includes("PROCESSING") && 'bg-yellow-100 text-yellow-500'}
                ${record.status.includes("FAILED") && 'bg-red-100 text-red-500'}`;
    }

    function isResultEmpty() {
        return !isLoading && records?.length === 0;
    }

}
