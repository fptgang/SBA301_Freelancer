import React, { useContext } from 'react'
import { Card, Form, Switch, Typography, message, Select, Space } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';
import { ColorModeContext } from '../../../contexts/color-mode';

const { Title } = Typography;
const { Option } = Select;

const LocalSettingsPage: React.FC = () => {
  const { mode, setMode } = useContext(ColorModeContext);
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState('HH:mm:ss');
  const currentDate = dayjs();

  const dateFormats = [
    { id: 'ymd', format: 'YYYY-MM-DD' },
    { id: 'mdy', format: 'MM/DD/YYYY' },
    { id: 'dmy', format: 'DD/MM/YYYY' },
    { id: 'mdy-short', format: 'MMM DD, YYYY' },
    { id: 'mdy-long', format: 'MMMM DD, YYYY' }
  ];

  const timeFormats = [
    { id: '24h', format: 'HH:mm:ss' },
    { id: '24h-simple', format: 'HH:mm' },
    { id: '12h', format: 'hh:mm:ss A' },
    { id: '12h-simple', format: 'hh:mm A' }
  ];

  const handleThemeChange = (checked: boolean) => {
    setMode(checked ? 'dark' : 'light');
    message.success(`Theme changed to ${checked ? 'dark' : 'light'} mode`);
  };

  const handleDateFormatChange = (format: string) => {
    setDateFormat(format);
    message.success('Date format updated successfully');
  };

  const handleTimeFormatChange = (format: string) => {
    setTimeFormat(format);
    message.success('Time format updated successfully');
  };

  return (
    <>
    <Card>
      <Title level={3}>Local Settings</Title>
      <Form layout="vertical" style={{ maxWidth: 400 }}>
        <Form.Item label="Dark Mode">
          <Switch
            checked={mode === 'dark'}
            onChange={handleThemeChange}
            checkedChildren="Dark"
            unCheckedChildren="Light"
          />
        </Form.Item>
        <Form.Item label="Date Format">
          <Select
            value={dateFormat}
            onChange={handleDateFormatChange}
            style={{ width: '100%' }}
          >
            {dateFormats.map(({ id, format }) => (
              <Option key={id} value={format}>
                {currentDate.format(format)}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Time Format">
          <Select
            value={timeFormat}
            onChange={handleTimeFormatChange}
            style={{ width: '100%' }}
          >
            {timeFormats.map(({ id, format }) => (
              <Option key={id} value={format}>
                {currentDate.format(format)}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Card>
    </>
    );
};

export default LocalSettingsPage