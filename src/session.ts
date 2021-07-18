import sqlite3 from "sqlite3"

export default class SqliteSession {

  options: any;
  db: sqlite3.Database;

  constructor(options) {
    this.options = Object.assign({
      property: 'session',
      getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`,
      store: {}
    }, options)

    this.db = options.db
  }

  getSession(key: string) {
    console.log('get session:', key )
    return new Promise((resolve, reject) => {
      this.db.each("SELECT session FROM sessions WHERE key=:key", {
        ':key': key
      }, (err, row) => {

        console.log('cb:', err, row)
        if (err) {
          console.error(err);
          return reject(err)
        } else {
          console.log('row:', row);
          if (row.session) {
            console.log('resolve:', row.session);
            return resolve(JSON.parse(row.session))
          } else {
            console.log('resolve: empty')
            return resolve({})
          }
        }
      })


    })
  }

  saveSession(key: string, session: any) {
      console.log(session)
    return new Promise((resolve, reject) => {
        this.db.get('INSERT OR REPLACE INTO sessions(key, session) VALUES (:key, :session)', {
          ':key': key,
          ':session': JSON.stringify(session)
        }, (err, row) => {
          if (err) {
            return reject(err)
          } else {
            return resolve(undefined)
          }
        })
      })
    }

  middleware() {
      return(ctx, next) => {
      const key = this.options.getSessionKey(ctx)
      if(!key) {
        return next()
      }
      return this.getSession(key).then((session) => {

        Object.defineProperty(ctx, this.options.property, {
          get: function () { return session },
          set: function (newValue) { session = Object.assign({}, newValue) }
        })
        return next().then(() => this.saveSession(key, session))
      })
    }
  }


}