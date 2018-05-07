import sleep from 'sleep-promise';
import {TimeoutError, InvalidOperationError} from 'common-errors';
import logger from '/logger';

export default class Worker {
    constructor(wid,timeout=30) {
        this.id=wid;
        this.isIdle = true;
        this.timeoutMs = timeout * 1000;
        this.ret = null;
        this.wait=[];
        this.ready=null;
    }
    finish(){
        return this.ready=(async()=>{
            try{await this.ready;}
            catch(e){logger.error(`Judge error @ worker `, e);}
            return {
                worker: this,
                ret: this.ret,
            };
        })();
    }
    run(taskFactory, err){
        return this.ready=(async()=>{
            try{await this.ready;}
            catch(e){logger.error(`Judge error @ worker `, e);}
            this.ret = null;
            try{
                this.ret=await taskFactory(this.id);
            }catch(e){
                err(e);
            }
        })();
    }
}
