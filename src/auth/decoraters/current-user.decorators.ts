import { createParamDecorator, ExecutionContext } from "@nestjs/common";


// createParamDecorator: A NestJS function that lets you define custom decorators for parameters (e.g., in controllers).

// ExecutionContext: Provides access to the context of the current request, like HTTP, WebSocket, etc.


export const CurrentUser = createParamDecorator(
    (data:unknown,ctx:ExecutionContext)=>{
        const request = ctx.switchToHttp().getRequest();  //ctx: The execution context (to get the request object).
        console.log("request.user------>",request.user);  //{ userId: 3, email: 'deepa@gmail.com' }
        
        return request.user
    }
)