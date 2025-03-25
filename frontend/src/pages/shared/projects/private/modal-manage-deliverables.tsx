import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  message,
  Modal,
  Popconfirm,
  Table,
  Typography,
  Upload
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined
} from '@ant-design/icons';
import {
  FileDto,
  MilestoneDto,
  MilestoneStatusDto
} from '../../../../../generated';
import api from '../../../../services/api/openapi-config';
import {handleFileDownload} from '../../../../components/common/file-list';
import {useInvalidate} from '@refinedev/core';
import {useLocalSettings} from '../../../../hooks/useLocalSettings';

const {Dragger} = Upload;
const {Title, Text, Paragraph} = Typography;

interface ManageDeliverablesProps {
  visible: boolean;
  milestone: MilestoneDto;
  onClose: () => void;
}

const ManageDeliverables: React.FC<ManageDeliverablesProps> = ({
                                                                 visible,
                                                                 milestone,
                                                                 onClose,
                                                               }) => {
  const [localSettings] = useLocalSettings();
  const [deliverables, setDeliverables] = useState<FileDto[]>([]);
  const invalidate = useInvalidate();

  useEffect(() => {
    setDeliverables(milestone?.deliverables?.filter(d => d.isVisible) || []);
  }, [milestone]);

  const handleDelete = async (fileId: number) => {
    try {
      await api.deleteFile({
        fileId
      });
      message.success('File deleted successfully');
      setDeliverables(prev => prev.filter(f => f.fileId !== fileId));
      invalidate({
        resource: "projects",
        id: milestone.projectId,
        invalidates: ["detail"],
      });
      invalidate({
        resource: "milestones",
        invalidates: ["list", "many"],
      });
    } catch (error) {
      message.error((error as Error).toString());
    }
  };

  const handleUpload = async (file: File) => {
    if (!milestone?.milestoneId) return;
    try {
      const uploadedFile = await api.uploadFile({
        blob: file,
        milestoneId: milestone.milestoneId
      });
      message.success('File uploaded successfully');
      setDeliverables(prev => [...prev, uploadedFile]);
      invalidate({
        resource: "projects",
        id: milestone.projectId,
        invalidates: ["detail"],
      });
      invalidate({
        resource: "milestones",
        invalidates: ["list", "many"],
      });
    } catch (error) {
      message.error((error as Error).toString());
    }
    return false;
  };

  const handleMarkAsDone = async () => {
    if (!milestone?.milestoneId) return;
    try {
      await api.submitMilestoneWork({
        milestoneId: milestone.milestoneId,
        blobs: []
      })
      message.success('Mark as done successfully');
      window.location.reload();
    } catch (error) {
      message.error((error as Error).toString());
    }
  };

  const confirmUpload = (file: File) => {
    return new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: 'Confirm Upload',
        content: `Are you sure you want to upload ${file.name}?`,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Upload Date ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? localSettings.formatDateTime(date) : 'N/A ',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => size ? `${(size / 1024).toFixed(2)} KB` : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FileDto) => (
        <>
          {(milestone && milestone.status === MilestoneStatusDto.InProgress) &&
            <Popconfirm
              title="Are you sure you want to delete this file?"
              onConfirm={() => handleDelete(record.fileId!)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined/>}
              >
                Delete
              </Button>
            </Popconfirm>}
          <Button
            icon={<DownloadOutlined/>}
            onClick={() => handleFileDownload(record.fileUrl!, record.fileName!)}
            style={{marginLeft: 8}}
          >
            Download
          </Button>
        </>
      ),
    },
  ];

  return (
    <Modal
      title="Manage Deliverables"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        (milestone && milestone.status === MilestoneStatusDto.InProgress) ?
          <Popconfirm
            key="done"
            title="Mark as Done"
            description={
              <>
                Are you sure you want to mark this milestone as done? <br/>
                This will notify the client for review.
              </>
            }
            onConfirm={handleMarkAsDone}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary">
              Mark as Done
            </Button>
          </Popconfirm> : <></>,
      ]}
    >
      <Alert
        message="Deliverable Management"
        description={
          <ul>
            <li>
              <Text>• Upload and manage your work files through this
                interface</Text>
            </li>
            <li>
              <Text>• After uploading all required deliverables, submit for
                client review using "Mark as Done"</Text>
            </li>
            <li>
              <Text>• During review phase: file deletion is disabled, but you
                can still upload additional files per client feedback</Text>
            </li>
            <li>
              <Text>• Payment will be processed upon client approval of
                deliverables</Text>
            </li>
            <li>
              <Text>• Contact support staff for any client-related
                concerns</Text>
            </li>
          </ul>
        }
        type="info"
        className="mb-4"
      />

      <Title level={5}>Upload Files</Title>
      <Dragger
        customRequest={({file}) => handleUpload(file as File)}
        beforeUpload={confirmUpload}
        multiple={true}
        showUploadList={false}
        className="mb-4"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined/>
        </p>
        <p className="ant-upload-text">Click or drag files to upload</p>
      </Dragger>

      <Title level={5}>Current Deliverables</Title>
      <Table
        columns={columns}
        dataSource={deliverables}
        rowKey="fileId"
        pagination={false}
      />
    </Modal>
  );
};

export default ManageDeliverables; 