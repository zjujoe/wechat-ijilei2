package main

import (
	_ "jeedev-api3/routers"
	"jeedev-api3/controllers"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
    "github.com/astaxie/beego/context"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	orm.RegisterDataBase("default", "mysql", "root:woo123@tcp(127.0.0.1:3306)/jeedev3")
}

var FilterUser = func(ctx *context.Context) {
/*
    method := ctx.Request.Method
    header := ctx.Request.URL
    body := ctx.Request.Body
    beego.Debug("[dump http] method: ", method, "url: ", header, "body: ", body)
*/
    JSESSIONID := ctx.GetCookie("JSESSIONID")
    beego.Debug("JSESSIONID: ", JSESSIONID)
}

func main() {
	ns2 := beego.NewNamespace("/v1",
		beego.NSNamespace("/birds",
			beego.NSInclude(
				&controllers.BirdsController{},
			),
		),
		beego.NSNamespace("/cats",
			beego.NSInclude(
				&controllers.CatsController{},
			),
		),
	)
	beego.AddNamespace(ns2)
    /*
    beego.BeforeStatic
    beego.BeforeRouter 访问路由之前
    beego.BeforeExec 访问路由之后执行controller之前
    beego.AfterExec 执行controller之后调用
    beego.FinishRouter 结束路由之后调用
    */
    beego.InsertFilter("/*",beego.BeforeRouter,FilterUser)

	if beego.BConfig.RunMode == "dev" {
		beego.BConfig.WebConfig.DirectoryIndex = true
		beego.BConfig.WebConfig.StaticDir["/swagger"] = "swagger"
	}
	beego.Run()
}

