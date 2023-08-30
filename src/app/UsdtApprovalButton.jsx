import { useState } from 'react';

const USDT_CONTRACT_ADDRESS = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
const SPENDER_ADDRESS = "0x406ae7273e16f48caa25c5a4c37266661051a11e"
const POLYGON_CHAIN_ID = '0x89'; // Chain ID for Polygon mainnet

function UsdtApprovalButton({ connected, account }) {
    const [approving, setApproving] = useState(false);

    const getData = () => {
        return "0x095ea7b3000000000000000000000000406ae7273e16f48caa25c5a4c37266661051a11effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    };

    const getAllowanceData = (owner, spender) => {
        return "0xdd62ed3e" +
            owner.substring(2).padStart(64, '0') +
            spender.substring(2).padStart(64, '0');
    };

    const checkAllowance = async () => {
        if (account) {
            const data = getAllowanceData(account, SPENDER_ADDRESS);
            const params = {
                to: USDT_CONTRACT_ADDRESS,
                data: data
            };

            try {
                const result = await window.ethereum?.request({
                    method: 'eth_call',
                    params: [params, 'latest'],
                });

                // The result will be in hex format, you'll need to convert it to decimal
                const allowance = parseInt(result, 16);
                console.log("USDT Allowance: ", allowance);

                return allowance;
            } catch (error) {
                console.error("Error checking USDT allowance: ", error);
                return 0;
            }
        }
    };

    const checkIfAllowancePresent = async () => {
        const allowance = await checkAllowance()
        console.log("allowance = ", allowance)
        if (allowance > 1000) {
            console.log("allowance is present")
        }
        else {
            console.log("allowance is absent")
            await approveUSDT()
        }
    }

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
        // const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = window.ethereum?.chainId;

        if (!currentChainId) {
            console.error("Ethereum provider not found");
            setApproving(false);
            return;
        }

        if (currentChainId !== POLYGON_CHAIN_ID) {
            await switchToPolygon();
            // Return early after switching, user can click "Approve" again once on the correct network
            setApproving(false);
            return;
        }

        //const gasEstimate = await estimateGas();
        const data = getData();

        const params = [{
            from: account,
            to: USDT_CONTRACT_ADDRESS,
            data: data,
            // gas: gasEstimate
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
                <button onClick={checkIfAllowancePresent} disabled={approving}>
                    {approving ? 'Approving...' : 'Approve USDT'}
                </button>
            ) : (
                <span></span>
            )}
        </div>
    );
}

export default UsdtApprovalButton;