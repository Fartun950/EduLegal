const Table = ({ headers, data, renderRow, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-lg ${className}`}>
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-blue-50/50 transition-smooth">
              {renderRow(row, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table




