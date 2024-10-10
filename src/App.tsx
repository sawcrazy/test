import { useState } from 'react';
import * as XLSX from 'xlsx';
import styles from './Calculator.module.css';

interface PersonData {
  fio: string;
  totalSalary: number;
  vacationPay: number;
}

const Calculator: React.FC = () => {
  const [data, setData] = useState<PersonData[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }) as any[][];

        processData(sheet);
      };

      reader.readAsBinaryString(file);
    }
  };

  const processData = (sheet: any[][]) => {
    const result = sheet.slice(1).reduce<PersonData[]>((acc, row, index) => {
      const [fio, year, month, salary] = row;

      if (fio) {
        if (index > 0 && acc.length > 0) {
          const prevPerson = acc[acc.length - 1];
          prevPerson.vacationPay = Math.floor(prevPerson.totalSalary / 12);
        }

        acc.push({ fio, totalSalary: salary || 0, vacationPay: 0 });
      } else if (acc.length > 0) {
        const lastPerson = acc[acc.length - 1];
        lastPerson.totalSalary += salary || 0;
      }

      return acc;
    }, []);

    if (result.length > 0) {
      const lastPerson = result[result.length - 1];
      lastPerson.vacationPay = Math.floor(lastPerson.totalSalary / 12);
    }

    setData(result);
  };

  return (
    <div className={styles.container}>
      <h1>Калькулятор</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {data.length > 0 && (
        <table className={styles.table}>
          <thead>
          <tr>
            <th>ФИО</th>
            <th>Общий заработок</th>
            <th>Отпускные</th>
          </tr>
          </thead>
          <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.fio}</td>
              <td>{row.totalSalary}</td>
              <td>{row.vacationPay.toFixed(2)}</td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Calculator;
