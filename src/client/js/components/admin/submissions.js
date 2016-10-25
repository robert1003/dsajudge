import Vue from 'vue';
import html from './submissions.pug';
import probUtils from '/mixins/probUtils';
import toastr from 'toastr';
import sleep from 'sleep-promise';
import _ from 'lodash';
import queryString from 'query-string';

export default Vue.extend({
    mixins: [probUtils],
    data() {
        return { 
            submissions: [],
            curTabId: 0,
            tabRange: [0, 1, 2, 3, 4],
            filter: {
                result: 'ALL',
                probID: '',
                user: '',
            },
        };
    },
    template: html,
    ready() {
        this.getSubmissions();
        $('#status-select').dropdown();
        (async () => {
            while (true) {
                await sleep(3000);
                await this.getSubmissions();
            }
        })();
    },
    methods: {
        async getSubmissions() {
            let result;
            const params = { skipPage: this.curTabId };
            const filter = this.filter;
            if (filter.result != 'ALL') params.result = filter.result;
            if (filter.probID) params.probID = filter.probID;
            if (filter.user) params.user = filter.user;
            try {
                result = await this.$http.get('/admin/submission/', { params });
            } catch(e) {
                console.log(e);
            }
            this.submissions = result.data;
        },
        async changeTab(idx) {
            this.curTabId = idx;
            await this.queryChanged();
        },
        async rejudge(id) {
            let result;
            try {
                result = await this.$http.get(`/admin/submission/${id}/rejudge`);
            } catch(e) {
                if (e.body) toastr.error(e.body);
                else console.log(e);
                return;
            }
            toastr.success(result.body);
            this.getSubmissions();
        },
        async queryChanged() {
            const query = {};
            _.assignIn(query, this.filter);
            query.s = this.curTabId;
            this.$route.router.go({
                name: 'admin.submissions',
                query,
            });
        }
    },
    watch: {
        'filter.result': function() {
            this.queryChanged();
        }
    },
    route: {
        data() {
            const {query} = this.$route;
            _.assignIn(this.filter, query);
            this.changeTab(query.s || 0);
            const tabStart = Math.max(0, this.curTabId - 2);
            this.tabRange = [];
            for (let i = 0; i < 5; i++) this.tabRange.push(tabStart + i);
            this.getSubmissions();
        }
    },
});

