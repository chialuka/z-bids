import { useState, useEffect } from "react";
import { Button, Input } from "@heroui/react";

interface TableEditorProps {
  tableData: string[][];
  onSave: (content: string) => Promise<void>;
}

export default function TableEditor({ tableData, onSave }: TableEditorProps) {
  const [editableData, setEditableData] = useState<string[][]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (tableData.length > 0) {
      setEditableData([...tableData]);
    }
  }, [tableData]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...editableData];
    newData[rowIndex][colIndex] = value;
    setEditableData(newData);
  };

  const handleAddColumn = () => {
    const newData = editableData.map(row => [...row, ""]);
    setEditableData(newData);
  };

  const handleRemoveColumn = (colIndex: number) => {
    const newData = editableData.map(row => {
      const newRow = [...row];
      newRow.splice(colIndex, 1);
      return newRow;
    });
    setEditableData(newData);
  };

  const handleAddRow = () => {
    const newRow = new Array(editableData[0].length).fill("");
    setEditableData([...editableData, newRow]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    const newData = [...editableData];
    newData.splice(rowIndex, 1);
    setEditableData(newData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure each row has exactly 3 columns
      const normalizedData = editableData.map(row => {
        const newRow = [...row];
        // Add empty columns if less than 3
        while (newRow.length < 3) {
          newRow.push('');
        }
        // Truncate if more than 3
        if (newRow.length > 3) {
          return newRow.slice(0, 3);
        }
        return newRow;
      });

      // Convert table data back to CSV string
      const csvContent = normalizedData
        .map(row => {
          // Quote only the third column (content) if it contains commas
          const col1 = row[0];
          const col2 = row[1];
          let col3 = row[2];
          
          // Escape quotes in content by doubling them
          if (col3.includes('"')) {
            col3 = col3.replace(/"/g, '""');
          }
          
          // Only quote the third column if it contains commas
          if (col3.includes(',')) {
            return `${col1},${col2},"${col3}"`;
          } else {
            return `${col1},${col2},${col3}`;
          }
        })
        .join('\n');
      
      await onSave(csvContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving table:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (editableData.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Edit CSV Data</h3>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button color="primary" onPress={() => setIsEditing(true)}>
              Edit Table
            </Button>
          ) : (
            <>
              <Button color="primary" onPress={handleAddColumn}>
                Add Column
              </Button>
              <Button color="primary" onPress={handleAddRow}>
                Add Row
              </Button>
              <Button 
                color="success" 
                onPress={handleSave}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
              <Button color="danger" onPress={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {editableData[0].map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300"
                >
                  {isEditing ? (
                    <div className="flex items-center">
                      <Input
                        value={header}
                        onChange={(e) => handleCellChange(0, index, e.target.value)}
                        className="w-full"
                      />
                      <Button 
                        color="danger" 
                        size="sm" 
                        onPress={() => handleRemoveColumn(index)}
                        className="ml-2"
                      >
                        X
                      </Button>
                    </div>
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {editableData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300"
                  >
                    {isEditing ? (
                      <Input
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex + 1, cellIndex, e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
                {isEditing && (
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                    <Button 
                      color="danger" 
                      size="sm" 
                      onPress={() => handleRemoveRow(rowIndex + 1)}
                    >
                      X
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
