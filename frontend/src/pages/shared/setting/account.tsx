import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
  Upload,
  Modal,
} from "antd";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import ImgCrop from "antd-img-crop";
import { useNavigate, useLocation } from "react-router";
import { store } from "../../../store";
import { useForm } from "@refinedev/antd";
import { AccountDto } from "../../../../generated";
import { on } from "events";
import { API_URL } from "../../../utils";
import api from "../../../services/api/openapi-config";
import {useNotification} from "@refinedev/core";

const { Title } = Typography;

const apiUrl = API_URL;

const AccountSettingsPage: React.FC = () => {
  const user = store.getState().auth.account;
  const token = store.getState().auth.accessToken;
  const { open } = useNotification();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Initialize fileList when component mounts and user is available
  React.useEffect(() => {
    if (user?.avatarUrl) {
      setFileList([{
        uid: '-1',
        name: 'avatar',
        status: 'done',
        url: user.avatarUrl,
      }]);
    }
  }, [user?.avatarUrl]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const handleProfileUpdate = async (values: AccountDto) => {
    // Validate names
    if (!values.firstName || values.firstName.trim().length < 2) {
      message.error("First name must be at least 2 characters long");
      return;
    }

    if (!values.lastName || values.lastName.trim().length < 2) {
      message.error("Last name must be at least 2 characters long");
      return;
    }
    try {
      await api.updateAccount({
        accountId: user?.accountId || 0,
        accountDto: values,
      });
      open?.({
        type: "success",
        message: "UpdateAccount",
        description: "Profile updated successfully",
      });
    } catch (e) {
      open?.({
        type: "error",
        message: "UpdateAccount",
        description: e.toString(),
      });
    }
  };

  const { formProps } = useForm<AccountDto>();

  if (!user) {
    return <div>Loading...</div>;
  }

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    console.log(newFileList);
    setFileList(newFileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <Card>
        <Title level={3}>Account Settings</Title>
        <Form layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item label="Avatar" style={{ textAlign: "center" }}>
            <ImgCrop rotationSlider aspectSlider showReset>
              <Upload
                action={apiUrl + "/accounts/" + user?.accountId + "/upload-avatar"}
                method="post"
                name="blob"
                headers={{ Authorization: `Bearer ${token}` }}
                listType="picture-circle"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </ImgCrop>
          </Form.Item>
        </Form>

        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
        </Modal>

        <Form
          {...formProps}
          layout="vertical"
          style={{ maxWidth: 400 }}
          initialValues={{
            firstName: user?.firstName,
            lastName: user?.lastName,
          }}
          onFinish={handleProfileUpdate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please input your first name!" },
                ]}
              >
                <Input placeholder="Enter your first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Please input your last name!" },
                ]}
              >
                <Input placeholder="Enter your last name" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default AccountSettingsPage;
