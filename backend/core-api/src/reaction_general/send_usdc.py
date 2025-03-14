from web3 import Web3

from src.auth.service import send_usdc
from src.llm.llm import get_openai_client
from src.auth.config import auth_setting


w3 = Web3(Web3.HTTPProvider(auth_setting.ZK_SYNC_SEPOLIA_RPC_URL))
aiClient = get_openai_client()


def determine_usdc_sent(task, db=None, **kwargs):
    # Dynamically build the context string based on the provided kwargs

    event_details = ", ".join([f"{key}: '{value}'" for key, value in kwargs.items()])

    # Construct the event notification message
    context = (
        f"User {task.user.username} has triggered the event '{task.trigger}'"
        f"{' with details: ' + event_details if event_details else '.'}"
    )

    # Max range of USDC tokens to be sent should be between 0% and 10% of the PAYMENT_RECEIVER_ADDRESS balance
    usdc_balance = get_usdc_balance("0xA655690467DA66600aE8E033016d471c134B0C69")
    max_usdc_tokens = usdc_balance * 0.1

    # Updated prompt to clearly indicate the expected response format
    prompt = (
        f"You encounter yourself with the task of rewarding a user on a specific task. The user has triggered the event '{task.trigger}'\n\n"
        f"Your task is to determine the amount of USDC tokens to be sent to the user. Criteria should be effort, value provided, length and correctness of event details, you have partly free will\n\n."
        f"Event Details:\n{context}\n\n"
        f"Your response can only be a number between 1 and {max_usdc_tokens} USDC tokens."
        f"The amount should not have more than 2 unit decimals, but the number has to be scaled for the 6 decimals of the USDC token."
        f"E.g. If the range is 1 and 200, your response should be between '1000000' and '200000000'."
        f"It's very important you return only the number since the system will handle the conversion to the right format."
    )

    # Encode the prompt
    completion = aiClient.chat.completions.create(
        model="gpt-3.5-turbo", messages=[{"role": "system", "content": prompt}]
    )

    usdc_amount_content = completion.choices[0].message.content
    return usdc_amount_content


def get_usdc_balance(user_from: str):
    usdc_contract = build_usdc_contract()
    balance = usdc_contract.functions.balanceOf(user_from).call()

    return balance


def build_usdc_contract():
    usdc_address = Web3.to_checksum_address(
        "0xAe045DE5638162fa134807Cb558E15A3F5A7F853"
    )

    contract_abi = [
        {
            "constant": True,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "payable": False,
            "stateMutability": "view",
            "type": "function",
        },
        {
            "constant": False,
            "inputs": [
                {"name": "_to", "type": "address"},
                {"name": "_value", "type": "uint256"},
            ],
            "name": "transfer",
            "outputs": [{"name": "success", "type": "bool"}],
            "payable": False,
            "stateMutability": "nonpayable",
            "type": "function",
        },
        # Include other necessary functions if needed
    ]


    usdc_contract = w3.eth.contract(address=usdc_address, abi=contract_abi)

    return usdc_contract


def transfer_usdc(service_from=None, task=None, db=None, **kwargs):
    print("Transfering USDC...")
    usdc_amount = determine_usdc_sent(task, db, **kwargs)
    print(f"USDC amount determined: {usdc_amount}")

    # Make sure 'usdc_amount' is a valid number
    usdc_amount = 0.01  # Amount in USDC
    scaled_usdc_amount = int(usdc_amount * 10**6)  # Scale to smallest unit (e.g., 10000)

    print(f"USDC amount (scaled): {scaled_usdc_amount}")

    # ! this is the error
    # try:
    #     usdc_amount = int(usdc_amount)
    # except ValueError:
    #     print("Invalid USDC amount. Please LLM provide a valid number.")
    #     return

    # TODO: Function to fetch the user's USDC address from the database
    print("Action Params: ", task.action_params)
    to_address = task.action_params[0]

    # check that is an address
    if not Web3.is_address(to_address):
        print("Invalid USDC address. Please provide a valid address.")
        return

    print(f"Sending {scaled_usdc_amount} USDC to address: {to_address}")

    send_usdc(to_address, scaled_usdc_amount)
