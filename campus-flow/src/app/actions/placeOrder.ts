"use server"
import {SendMessageCommand} from "@aws-sdk/client-sqs";
import {sqsClient,QUEUE_URL} from "@/lib/sqs";
export async function placeOrderAction(orderData:any)
{
    try
    {
const params = {
  QueueUrl: QUEUE_URL,
  MessageBody: JSON.stringify({
    ...orderData,
    timestamp: new Date().toISOString(),
  }),
};
    const command=new SendMessageCommand(params);
    const result=await sqsClient.send(command);
    console.log("Order pushed to SQS:",result.MessageId);
    return {success:true,messageId:result.MessageId};

}
catch(error)
{
    console.error("SQS error",error);
    return {success: false,error :"failed to place order inq ueue"};
}
}