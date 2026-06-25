import {SQSClient} from "@aws-sdk/client-sqs";
export const sqsClient=  new SQSClient({
    region: "us-east-1",
    endpoint:"https://localhost:4566",
    credentials:{
       accessKeyId: "test",
       secretAccessKey: "test", 
    },
});
export const QUEUE_URL="http://sqs.us-east-1.localhost:4566/000000000000/orders-queue";