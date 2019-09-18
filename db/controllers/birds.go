package controllers

import (
	"encoding/json"
	"strings"
    "path"
    "fmt"
    "net/http"
    "io/ioutil"
	"github.com/astaxie/beego"
)

// BirdsController operations for Birds
type BirdsController struct {
	beego.Controller
}

// URLMapping ...
func (c *BirdsController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// Post ...
// @Title Post
// @Description create Birds
// @Param	body		body 	models.Birds	true		"body for Birds content"
// @Success 201 {int} models.Birds
// @Failure 403 body is empty
// @router / [post]
func (c *BirdsController) Post() {
    f, h, _ := c.GetFile("img")
    if h != nil  {
        list1 :=  strings.Split(h.Filename, ".")
        filename2 := list1[len(list1) - 2] + "." + list1[len(list1) - 1]
        //strings.Replace(filename2, "jpeg", "jpg", 1)
        f.Close()
        c.SaveToFile("img", path.Join("static/files",filename2))
        c.Data["json"] = filename2
	    c.ServeJSON()
        return
    }

    c.Data["json"] = "OK"
	c.ServeJSON()
}

type AutotaskRequest struct {
    OpenId string `json:"openid"`
    SessionKey string     `json:"session_key"`
    UnionId string `json:"unionid"`
    
}

func httpGet(idStr string, type1 int64)  *AutotaskRequest {
    var url string
    if type1 == 1 {//superuser
    url = fmt.Sprintf("https://api.weixin.qq.com/sns/jscode2session?appid=wxf5521971d86598a1&secret=9eb104159943d38162d75d45b5797c5c&js_code=%s&grant_type=authorization_code", idStr)
    } else {//nomal user
    url = fmt.Sprintf("https://api.weixin.qq.com/sns/jscode2session?appid=wx0e35f45c729d1790&secret=c06f2723d464fa536130aa55cbf33681&js_code=%s&grant_type=authorization_code", idStr)
    }

    req, _ := http.NewRequest("GET", url, nil)
    res, _ := http.DefaultClient.Do(req)
    defer res.Body.Close()
    body, _ := ioutil.ReadAll(res.Body)

    var config AutotaskRequest
    if err := json.Unmarshal(body, &config); err != nil {
        panic(err)
    }
    
    return &config
}

// GetOne ...
// @Title Get One
// @Description get Birds by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.Birds
// @Failure 403 :id is empty
// @router /:id [get]
func (c *BirdsController) GetOne() {
	idStr := c.Ctx.Input.Param(":id")
	//id, _ := strconv.Atoi(idStr)
    if strings.Count(idStr,"") > 10 {
    } else if idStr == "download" {
        var filename string
        if v := c.GetString("filename"); v != "" {
            filename = v
        }
        c.Ctx.Output.Download("static/files/" + filename)
        c.Data["json"] = "OK"
        //fmt.Println("...................................., bird 102",c.Ctx.ResponseWriter.Status)
    } else {
        c.Data["json"] = "OK"
    }
	c.ServeJSON()
}

// GetAll ...
// @Title Get All
// @Description get Birds
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.Birds
// @Failure 403
// @router / [get]
func (c *BirdsController) GetAll() {
    var type1 int64

    if v, err := c.GetInt64("type"); err == nil {
        type1 = v
    }
    c.Data["json"] = "OK"
    switch type1 {
        case 1: // for superuser, get open id
            fallthrough
        case 3: // for normal user, get open id
            var wxcode string
            if v := c.GetString("wxcode"); v != "" {
                wxcode = v
            }
            c.Data["json"] = httpGet(wxcode, type1)
        case 2: // for superuser, register
            var CreateDate string
            var Openid string
            var Name string
            var Phonenumber string
            if v := c.GetString("CreateDate"); v != "" {
                CreateDate = v
            }
            if v := c.GetString("Openid"); v != "" {
                Openid = v
            }
            if v := c.GetString("Name"); v != "" {
                Name = v
            }
            if v := c.GetString("Phonenumber"); v != "" {
                Phonenumber = v
            }
    
            fmt.Println("new super use apply:...")
            fmt.Println("CreateDate:" + CreateDate)
            fmt.Println("Openid:" + Openid)
            fmt.Println("Name:" + Name)
            fmt.Println("Phonenumber:" + Phonenumber)
        default:
    }
    

	c.ServeJSON()
}

// Put ...
// @Title Put
// @Description update the Birds
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.Birds	true		"body for Birds content"
// @Success 200 {object} models.Birds
// @Failure 403 :id is not int
// @router /:id [put]
func (c *BirdsController) Put() {
	//idStr := c.Ctx.Input.Param(":id")
	//id, _ := strconv.Atoi(idStr)
    c.Data["json"] = "OK"
	c.ServeJSON()
}

// Delete ...
// @Title Delete
// @Description delete the Birds
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 id is empty
// @router /:id [delete]
func (c *BirdsController) Delete() {
	//idStr := c.Ctx.Input.Param(":id")
	//id, _ := strconv.Atoi(idStr)
    c.Data["json"] = "OK"
	c.ServeJSON()
}
