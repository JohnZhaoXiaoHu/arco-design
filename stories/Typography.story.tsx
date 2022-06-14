import React from 'react';
import { Typography, Table } from '@self';

const mockText =
  'A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design. A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    render() {
      return (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
            expandable: true,
          }}
        >
          {mockText}
        </Typography.Paragraph>
      );
    },
  },
  {
    title: 'Salary',
    dataIndex: 'salary',
    render() {
      return (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
            expandable: true,
          }}
        >
          {mockText}
        </Typography.Paragraph>
      );
    },
  },
  {
    title: 'Address',
    dataIndex: 'address',
    render() {
      return (
        <Typography.Paragraph
          code
          ellipsis={{
            rows: 3,
            expandable: true,
          }}
        >
          {mockText}
        </Typography.Paragraph>
      );
    },
  },
  {
    title: 'Email',
    dataIndex: 'email',
    render() {
      return <Typography.Paragraph>email,email</Typography.Paragraph>;
    },
  },
];

function DemoExpand() {
  return (
    <Table
      columns={columns}
      pagination={false}
      data={new Array(50).fill('').map((_, index) => ({
        key: index,
        name: 'Jane Doe',
        salary: 23000,
        address: '32 Park Road, London',
        email: 'jane.doe@example.com',
      }))}
    />
  );
}
export const Expand = () => <DemoExpand />;

export default {
  title: 'Typography',
};
