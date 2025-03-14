"use client";

import { useParams } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { erc20Abi } from "viem";
import {
  type BaseError,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
  useSwitchChain
} from "wagmi";
import {zksyncSepoliaTestnet} from "wagmi/chains";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/hooks/useUser";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Steps } from "@/components/ui/steps";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const FREE_PLAN_AMOUNT = BigInt(10 /** 10 ** 6*/); // 10 USDC, scaled to 6 decimals
const USDC_ZKSYNC_ADDRESS = "0xAe045DE5638162fa134807Cb558E15A3F5A7F853";
const PAYMENT_RECEIVER_ADDRESS = "0xA655690467DA66600aE8E033016d471c134B0C69";

export function CryptoProcessor() {
  const { plan } = useParams<{ plan: string }>();
  const { address, isConnected } = useAccount();
  const { switchChain } = useSwitchChain()
  const { user } = useUser();
  const router = useRouter();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { data: balanceOfConnectedAddress } = useReadContract({
    address: USDC_ZKSYNC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address || "0x0"],
  });
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Connect Wallet", description: "Connect your crypto wallet" },
    { title: "Confirm Plan", description: "Approve the transaction" },
    { title: "Processing", description: "Wait for confirmation" },
    { title: "Complete", description: "Plan confirmed" },
  ];

  const transferUsdc = async () => {
    const res = await fetch(`${apiUrl}/request_mock_usdc/${address}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }
  };

  useEffect(() => {
    if (isConnected) {
      switchChain({chainId: zksyncSepoliaTestnet.id})
    }
  }, [isConnected]);

  useEffect(() => {
    if (
      address &&
      balanceOfConnectedAddress &&
      balanceOfConnectedAddress < FREE_PLAN_AMOUNT
    ) {
      transferUsdc();
    }
  }, [address, balanceOfConnectedAddress]);

  useEffect(() => {
    if (isConnected) setCurrentStep(1);
  }, [isConnected]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (plan === "free") {
      writeContract({
        address: USDC_ZKSYNC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [PAYMENT_RECEIVER_ADDRESS, FREE_PLAN_AMOUNT],
      });
    } else if (plan === "personal") {
      writeContract({
        address: USDC_ZKSYNC_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [PAYMENT_RECEIVER_ADDRESS, FREE_PLAN_AMOUNT],
      });
    }
    setCurrentStep(2);
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      fetch(`${apiUrl}/plan/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });
      setCurrentStep(3);
      toast({
        title: "Payment Confirmed",
        description: `Your ${plan} plan has been successfully confirmed.`,
        action: (
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        ),
      });
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (error && currentStep === 1 && error.message.includes("connected")) {
      setCurrentStep(0);
    }
    if (error && currentStep === 2 && !isPending) {
      setCurrentStep(1);
    }
  }, [error]);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-20">
      <CardHeader>
        <CardTitle>
          Confirm Your{" "}
          <span className="text-green-700">
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>{" "}
          Plan
        </CardTitle>
        <CardDescription>
          Follow the steps below to confirm your plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Steps currentStep={currentStep} steps={steps} className="mb-8" />

        <div className="space-y-4">
          {currentStep === 0 && (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={submit}>
              <Button type="submit" className="w-full">
                Confirm {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </Button>
            </form>
          )}

          {currentStep === 2 && (
            <Alert>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <AlertTitle>Processing Transaction</AlertTitle>
              <AlertDescription>
                Please wait while we process your transaction...
              </AlertDescription>
            </Alert>
          )}

          {currentStep === 3 && (
            <Alert variant="default">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <AlertTitle>Transaction Confirmed</AlertTitle>
              <AlertDescription>
                Your {plan} plan has been successfully confirmed.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        {hash && (
          <Alert>
            <AlertTitle>Transaction Hash</AlertTitle>
            <AlertDescription className="break-all">{hash}</AlertDescription>
          </Alert>
        )}
        {isConfirmed && (
          <Alert variant="default">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <AlertTitle>View Transaction</AlertTitle>
            <AlertDescription>
              <a
                href={`https://sepolia.explorer.zksync.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on Explorer
              </a>
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as BaseError).shortMessage || error.message}
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
