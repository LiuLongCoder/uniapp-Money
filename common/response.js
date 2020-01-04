class ResponseModel {
	constructor () {
		this.Header = new ResponseHeaderModel()
		this.Body = ''
		this.originalBody = ''
	}

	static builderWithResponse(json) {
        let responseModel = new ResponseModel();
        if (typeof json === "object") {
            responseModel.Header = ResponseHeaderModel.builderWithResponseHeader(json.Header);
            // responseModel.Body = Util.mxrDecoder(json.Body);
			responseModel.Body = json.Body
            // responseModel.originalBody = json.Body;
        } else if (typeof json === "string") {
            let myJson = JSON.parse(json);
            responseModel.Header = ResponseHeaderModel.builderWithResponseHeader(myJson.Header);
            // responseModel.Body = Util.mxrDecoder(myJson.Body);
			responseModel.Body = myJson.Body
            // responseModel.originalBody = myJson.Body;
        } else {
            responseModel.Header = new ResponseHeaderModel();
            responseModel.Body = '';
            responseModel.originalBody = '';
        }
        return responseModel;
    }
	
	isSuccess () {
		if (this.Header.ErrCode === 0 || this.Header.ErrCode === '0') {
			return true
		} 
		return false
	}
	
	toJSON () {
		return { Header: this.Header.toJSON(), Body: this.Body }
	}

	toString () {
		return JSON.stringify(this.toJSON())
	}
}

class ResponseHeaderModel {
	constructor () {
		this.ErrCode = 0
		this.ErrMsg = ''
	}

	static builderWithResponseHeader(json) {
        let responseHeaderModel = new ResponseHeaderModel();
        if (typeof json === "object") {
            responseHeaderModel.ErrCode = json.ErrCode;
            responseHeaderModel.ErrMsg = json.ErrMsg;
        } else if (typeof json === "string") {
            let myJson = JSON.parse(json);
            responseHeaderModel.ErrCode = myJson.ErrCode;
            responseHeaderModel.ErrMsg = myJson.ErrMsg;
        } else {
            responseHeaderModel.ErrCode = 0;
            responseHeaderModel.ErrMsg = '';
        }
        return responseHeaderModel;
    }
	

	toJSON () {
		return { ErrCode: this.ErrCode, ErrMsg: this.ErrMsg }
	}

	toString () {
		return JSON.stringify(this.toJSON())
	}
}

module.exports = ResponseModel
