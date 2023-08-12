import { useEffect, useState } from 'react';

const USDT_CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // Replace with your USDT contract address
const SPENDER_ADDRESS = "0x406aE7273E16F48caA25C5a4C37266661051A11e";   // Replace with the address that needs to spend the USDT

function UsdtApprovalButton({ connected, account }) {
    const [approving, setApproving] = useState(false);
    
    const approveUSDT = async () => {
        setApproving(true);

        const params = [{
            from: account,
            to: USDT_CONTRACT_ADDRESS,
            data: "0x095ea7b3" + 
                  "000000000000000000000000" + account.substring(2) + 
                  "100000000000000000000000000" 
        }];

        try {
            const result = await window.ethereum?.request({
                method: 'eth_sendTransaction',
                params,
            });
            console.log("Approval TX Result: ", result);
        } catch (e) {
            console.error("Error approving USDT: ", e);
        } finally {
            setApproving(false);
        }
    };

    return (
        <div>
            {connected ? (
                <button onClick={approveUSDT} disabled={approving}>
                    {approving ? 'Approving...' : 'Approve USDT'}
                </button>
            ) : (
                <span>Please connect your wallet first.</span>
            )}
        </div>
    );
}

export default UsdtApprovalButton;
