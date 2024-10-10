import { useState } from "react";
import * as XLSX from "xlsx";

// Определение интерфейса для данных сотрудника
interface PersonData {
  fio: string;
  totalSalary: number;
  vacationPay: number;
}

const VacationCalculator: React.FC = () => {
  const [data, setData] = useState<PersonData[]>([]);

  // Обработчик загрузки файла
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

  // Обработка данных для расчета отпускных
  const processData = (sheet: any[][]) => {
    let result: PersonData[] = [];
    let currentPerson: string | null = null;
    let annualSalary = 0;

    for (let i = 1; i < sheet.length; i++) {
      const row = sheet[i];
      const [fio, year, month, salary] = row;

      if (fio) {
        if (currentPerson) {
          // Считаем отпускные для предыдущего человека
          const vacationPay = (annualSalary / 12);
          result.push({ fio: currentPerson, totalSalary: annualSalary, vacationPay });
        }
        currentPerson = fio;
        annualSalary = 0;
      }

      if (salary) {
        annualSalary += salary;
      }
    }

    if (currentPerson) {
      const vacationPay = (annualSalary / 12) * 2.33;
      result.push({ fio: currentPerson, totalSalary: annualSalary, vacationPay });
    }

    setData(result);
  };

  return (
    <div>
      <h1>Vacation Calculator</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {data.length > 0 && (
        <table border="1" cellPadding="10">
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

export default VacationCalculator;
