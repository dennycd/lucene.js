#include <v8.h>
#include <node.h>
#include <unistd.h>

using namespace v8;
using namespace node;

/**
 sleep in seconds
**/
Handle<Value> Sleep(const Arguments& args) {
    HandleScope scope;
    
    if (args.Length() < 1 || !args[0]->IsUint32()) {
        return ThrowException(Exception::TypeError(String::New("Expected number of seconds")));
    }
    
    sleep(args[0]->Uint32Value());
    
    return scope.Close(Undefined());
}

/**
 sleep in microseconds
**/
Handle<Value> USleep(const Arguments& args) {
    HandleScope scope;
    
    if (args.Length() < 1 || !args[0]->IsUint32()) {
        return ThrowException(Exception::TypeError(String::New("Expected number of micro")));
    }
    
    usleep(args[0]->Uint32Value());
    
    return scope.Close(Undefined());
}

/**
 sleep in miliseconds
**/
Handle<Value> MSleep(const Arguments& args) {
    HandleScope scope;
    
    if (args.Length() < 1 || !args[0]->IsUint32()) {
        return ThrowException(Exception::TypeError(String::New("Expected number of micro")));
    }
    
    usleep(args[0]->Uint32Value() * 1000);
    
    return scope.Close(Undefined());
}


void init(Handle<Object> exports) {
    exports->Set(String::NewSymbol("sleep"), FunctionTemplate::New(Sleep)->GetFunction());
    exports->Set(String::NewSymbol("usleep"), FunctionTemplate::New(USleep)->GetFunction());
    exports->Set(String::NewSymbol("msleep"), FunctionTemplate::New(MSleep)->GetFunction());
}

NODE_MODULE(sleep,init)

