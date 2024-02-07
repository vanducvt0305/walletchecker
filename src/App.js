import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css'

const App = () => {
  const [activeBalances, setActiveBalances] = useState({});
  const api_key = "cqt_rQfJGWdcVQHQBJHyP9VhvrvWmB7X";
  const [walletInput, setWalletInput] = useState("");
  const [wallet_addresses, setWalletAddresses] = useState([]);
  const [rows, setRows] = useState(10);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setWalletInput(input);

    const lineCount = input.split("\n").length;
    setRows(lineCount > 1 ? lineCount : 1);
  };

  const handleProcessWallets = () => {
    const addresses = walletInput
      .split("\n")
      .filter((address) => address.trim() !== "");
    setWalletAddresses(addresses);
  };
  const chain_ids = [
    "1",
    "137",
    "56",
    "43114",
    "250",
    "10",
    "42161",
    "5000",
    "324",
  ];

  const chainNames = {
    1: "Ethereum",
    137: "Polygon",
    56: "Binance Smart Chain",
    43114: "Avalanche C Chain",
    250: "Fantom",
    10: "Optimism",
    42161: "Arbitrum",
    5000: "Manto",
    324: "Zksync Era",

    // Bổ sung thêm các chuỗi khác theo cách tương tự
  };
  // Hàm delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchBalances = async () => {
      for (const wallet_address of wallet_addresses) {
        for (const chain_id of chain_ids) {
          await delay(1000); // Đợi 1 giây giữa các yêu cầu
          try {
            const url = `https://api.covalenthq.com/v1/${chain_id}/address/${wallet_address}/balances_v2/`;
            const response = await axios.get(url, { params: { key: api_key } });

            // Kiểm tra hoạt động của chuỗi bằng cách xác định xem có token nào với số dư lớn hơn 0
            const activeTokens = response.data.data.items.filter(
              (token) => parseInt(token.balance) > 0
            );
            if (activeTokens.length > 0) {
              setActiveBalances((prevBalances) => ({
                ...prevBalances,
                [`${wallet_address}_${chain_id}`]: activeTokens,
              }));
            }
          } catch (error) {
            console.error(
              `Error fetching data for wallet ${wallet_address} on chain ID ${chain_id}: `,
              error
            );
          }
        }
      }
    };

    fetchBalances();
  }, [wallet_addresses]);
  const convertBalance = (balance, decimals) => {
    return (balance / Math.pow(10, decimals)).toFixed(4); // Làm tròn số để dễ đọc hơn
  };
  const groupedData = Object.entries(activeBalances).reduce(
    (acc, [walletChain, tokens]) => {
      const [walletAddress, chainId] = walletChain.split("_");
      if (!acc[walletAddress]) {
        acc[walletAddress] = [];
      }
      acc[walletAddress].push({ chainId, tokens });
      return acc;
    },
    {}
  );

  return (
    <div>
      <div>
        <textarea
          value={walletInput}
          onChange={handleInputChange}
          rows={rows}
          style={{ width: "100%" }}
          placeholder="Nhập địa chỉ ví, mỗi địa chỉ trên một dòng..."
        />
        <button onClick={handleProcessWallets} className='submit-btn btn'>Check</button>
        {/* Hiển thị danh sách địa chỉ ví */}
      </div>
      
      <div>
        {Object.entries(groupedData).map(([walletAddress, chains]) => (
          <div key={walletAddress} style={cardStyle}>
            <h3 style={cardHeaderStyle}>Địa chỉ ví: {walletAddress}</h3>
            {chains.map(({ chainId, tokens }, index) => (
              <div key={index} style={tableContainerStyle}>
                <h4>{chainNames[chainId] || `Chain ${chainId}`}</h4>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={columnStyle}>Contract Name</th>
                      <th style={balanceColumnStyle}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, tokenIndex) => (
                      <tr key={tokenIndex}>
                        <td style={columnStyle}>{token.contract_name}</td>
                        <td style={balanceColumnStyle}>
                          {convertBalance(
                            token.balance,
                            token.contract_decimals
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "10px",
  margin: "10px 0",
  backgroundColor: "#f9f9f9",
};

const cardHeaderStyle = {
  color: "#333",
  borderBottom: "1px solid #ddd",
  paddingBottom: "10px",
  marginBottom: "10px",
  display: "block", // Đặt container là block để sử dụng margin auto
  width: "100%",
  maxWidth: "700px",
  overflowX: "auto",
  margin: "auto",
};
const tableContainerStyle = {
  display: "block", // Đặt container là block để sử dụng margin auto
  width: "100%",
  maxWidth: "400px",
  overflowX: "auto",
  margin: "auto", // Căn giữa container trong phạm vi của nó
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};
const columnStyle = {
  textAlign: "left", // hoặc 'center', tùy thuộc vào ý thích của bạn
};

const balanceColumnStyle = {
  textAlign: "right", // Để số dư được căn phải
  minWidth: "150px", // Đặt chiều rộng tối thiểu để đảm bảo cột được căn chỉnh
};
export default App;
